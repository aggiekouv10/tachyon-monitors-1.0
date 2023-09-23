package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	"github.com/valyala/fasthttp"
)

func FastMonitor(site *Site) {
	var lastProductList ProductList
	// var lastJSONString string
	passwordPage := "UNKNOWN"

	var embeds []string
	for {
		embeds = nil
		// site.RotateProxy()
		site.CurrentProxy = proxies[rand.Intn(len(proxies))]
		client := &fasthttp.Client{Dial: FasthttpHTTPDialer(site.CurrentProxy)}

		currentTime := time.Now().UnixMilli()
		siteURL := fmt.Sprintf("%s/products.json?limit=250&order=%d&q=%d", site.URL, rand.Int(), rand.Int())
		req := fasthttp.AcquireRequest()
		req.SetRequestURI(siteURL)
		// req.SetRequestURI("http://127.0.0.1:8082")
		// req.Header.Set("poptls-url", siteURL)
		// req.Header.Set("poptls-proxy", proxies[rand.Intn(len(proxies))])
		// req.Header.Set("Poptls-Timeout", "2")
		// req.Header.Set("poptls-allowredirect", "false")
		//req.Header.Set("Sec-Ch-Ua", "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"")
		//req.Header.Set("Sec-Ch-Ua-Mobile", "?0")
		//req.Header.Set("Upgrade-Insecure-Requests", "1")
		//req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36")
		//req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
		//req.Header.Set("Accept-Encoding", "br")
		//req.Header.Set("Sec-Fetch-Site", "none")
		//req.Header.Set("Sec-Fetch-Mode", "navigate")
		//req.Header.Set("Sec-Fetch-User", "?1")
		//req.Header.Set("Sec-Fetch-Dest", "document")
		//req.Header.Set("Accept-Language", "en-US,en;q=0.9")

		resp := fasthttp.AcquireResponse()
		err := client.DoTimeout(req, resp, time.Duration(site.Timeout)*time.Millisecond)
		if err != nil {
			if err.Error() == "timeout" {
				log.Printf("[SHOPIFY] Timeout (%s) - %dms - %s\n", site.URL, time.Now().UnixMilli()-currentTime, site.CurrentProxy)
			} else if err.Error() == "HostClient can't follow redirects to a different protocol, please use Client instead" {
				log.Printf("[SHOPIFY] Redirect (%s) - %dms - %s\n", site.URL, time.Now().UnixMilli()-currentTime, site.CurrentProxy)
			} else if err.Error() == "could not connect to proxy" {
				log.Printf("[SHOPIFY] PROXY CONN ERR (%s) - %dms - %s\n", site.URL, time.Now().UnixMilli()-currentTime, site.CurrentProxy)
			} else if strings.Contains(err.Error(), "TCP address timed out") {
				log.Printf("[SHOPIFY] TCP Timeout (%s) - %dms - %s\n", site.URL, time.Now().UnixMilli()-currentTime, site.CurrentProxy)
			} else if strings.Contains(err.Error(), "the server closed connection") {
				log.Printf("[SHOPIFY] Connection: close (%s) - %dms - %s\n", site.URL, time.Now().UnixMilli()-currentTime, site.CurrentProxy)
			} else if strings.Contains(err.Error(), "i/o timeout") {
				log.Printf("[SHOPIFY] I/O Timeout (%s) - %dms - %s\n", site.URL, time.Now().UnixMilli()-currentTime, site.CurrentProxy)
			} else if strings.Contains(err.Error(), "Only one usage of each socket address") {
				log.Printf("[SHOPIFY] Only one usage of each socket address (%s) - %dms - %s\n", site.URL, time.Now().UnixMilli()-currentTime, site.CurrentProxy)
			} else {
				log.Printf("[SHOPIFY] ERR - %s - %s\n", siteURL, site.CurrentProxy)
				log.Fatalln(err.Error())
			}
			fasthttp.ReleaseRequest(req)
			fasthttp.ReleaseResponse(resp)
			continue
		}

		// Verify the content type
		// contentType := resp.Header.Peek("Content-Type")
		// // if bytes.Index(contentType, []byte("application/json")) != 0 {
		// // 	fmt.Printf("Expected content type application/json but got %s\n", contentType)
		// // 	log.Fatalf("Expected content type application/json but got %s\n", contentType)
		// // 	return
		// // }

		contentEncoding := string(resp.Header.Peek("Content-Encoding"))
		var prodJSONBytes []byte
		if strings.Contains(contentEncoding, "gzip") {
			// log.Println("Unzipping gzip")
			prodJSONBytes, _ = resp.BodyGunzip()
		} else if strings.Contains(contentEncoding, "br") {
			// log.Println("Unzipping br")
			prodJSONBytes, _ = resp.BodyUnbrotli()
		} else if strings.Contains(contentEncoding, "deflate") {
			// log.Println("Unzipping gzip")
			prodJSONBytes, _ = resp.BodyInflate()
		} else {
			// log.Println(contentEncoding, site.URL)
			prodJSONBytes = resp.Body()
		}
		// fmt.Println(string(prodJSONBytes))
		// log.Fatal()
		statusCode := resp.StatusCode()
		// log.Println(statusCode)
		if statusCode != 200 { // Handle non 200 responses
			if statusCode == 429 {
				log.Printf("[SHOPIFY] 429 (%s) - %s", site.URL, site.CurrentProxy)
			} else if statusCode == 500 {
				log.Printf("[SHOPIFY] 500 (%s) - %s", site.URL, site.CurrentProxy)
			} else if statusCode == 403 {
				log.Printf("[SHOPIFY] 403 (%s) - %s", site.URL, site.CurrentProxy)
			} else if statusCode == 404 {
				log.Printf("[SHOPIFY] 403 (%s) - %s", site.URL, site.CurrentProxy)
			} else if statusCode == 409 {
				log.Printf("[SHOPIFY] 409 (%s) - %s", site.URL, site.CurrentProxy)
			} else if statusCode == 503 {
				log.Printf("[SHOPIFY] 503 (%s) - %s", site.URL, site.CurrentProxy)
			} else if statusCode == 502 {
				log.Printf("[SHOPIFY] 503 (%s) - %s", site.URL, site.CurrentProxy)
			} else if statusCode == 530 {
				log.Printf("[SHOPIFY] 530 (%s) - %s", site.URL, site.CurrentProxy)
			} else if statusCode == 430 {
				log.Printf("[SHOPIFY] 430 (%s) - %s", site.URL, site.CurrentProxy)

			} else if statusCode == 401 { // When response is 401 (unauthorized), its a password page block.
				if passwordPage == "DOWN" {
					log.Printf("[SHOPIFY] Password Page UP (1) (%s)\n", site.URL)
					// go getPasswordHook("UP", site)
				}
				passwordPage = "UP"
			} else {
				log.Printf("[SHOPIFY] UNHANDLED STATUS CODE (%d) - %s - %s", statusCode, site.URL, site.CurrentProxy)
				log.Fatalln(err)
			}

		} else { // It's a succesfull 200 response code
			// if site.URL == "https://aj1low.travisscott.com" {
			// 	fmt.Println(200, "https://aj1low.travisscott.com")
			// }
			// Handle Password Page Status
			if contentEncoding == "a" { // FastHTTP apparently doesnt fucking care if 401 or 200 so this works (afaik, may have issues)
				if passwordPage == "DOWN" {
					log.Printf("[SHOPIFY] Password Page UP (2) (%s)\n", site.URL)
					// go getPasswordHook("UP", site)
				}
				passwordPage = "UP"
			} else {
				if passwordPage == "UP" {
					log.Printf("[SHOPIFY] Password Page DOWN (%s)\n", site.URL)
					go getPasswordHook("DOWN", site)
				}
				passwordPage = "DOWN"
			}
			var prodList ProductList
			json.Unmarshal(prodJSONBytes, &prodList)

			// log.Println(string(prodJSONString))
			if len(prodList.Products) == 0 {
				// fmt.Println(string(prodJSONBytes))
				// fmt.Println(resp.Header)
				// log.Fatalln(resp.StatusCode)
				if time.Now().UnixMilli()-currentTime >= site.Timeout {
					log.Printf("[SHOPIFY] Timeout (%s) - %s\n", site.URL, site.CurrentProxy)
				} else if statusCode == 401 || string(prodJSONBytes) == "" {

				} else if string(prodJSONBytes) == `{"products":[]}` {

				} else if strings.Contains(string(prodJSONBytes), "403") {
					log.Printf("[SHOPIFY] 403 (%s) - %dms - %s\n", site.URL, time.Now().UnixMilli()-currentTime, site.CurrentProxy)
				} else {
					log.Printf("[SHOPIFY] (%s) %d - %dms - %d - %s\n", site.URL, len(prodList.Products), time.Now().UnixMilli()-currentTime, statusCode, site.CurrentProxy)
					log.Fatalln(string(prodJSONBytes))
				}
				fasthttp.ReleaseRequest(req)
				fasthttp.ReleaseResponse(resp)
				continue
			}

			// log.Printf("[SHOPIFY] (%s) %d - %dms - %s\n", site.URL, len(prodList.Products), time.Now().UnixMilli()-currentTime, site.CurrentProxy)
			// currentTime = time.Now().UnixMilli()
			// prodJSONString := string(prodJSONBytes)

			if len(lastProductList.Products) == 0 { // Or you can do len(lastProductList.Products) // I dont really know if comparing as string is faster or not, do we even need lastJSONString??
				// lastJSONString = prodJSONString
				lastProductList = prodList
				continue
			}
			// if lastJSONString == prodJSONString { // If lastJSONString is same as current (meaning same response), then skip further iteration of each product, since we know nothing changed (Again, is this really needed? Is it just increasing load?)
			// 	// log.Printf("%d - %d\n", len(prodList.Products), time.Now().UnixMilli()-currentTime)
			// 	continue
			// }
			for _, prod := range prodList.Products {
				isNewProduct := true
				isRestock := false
				hasAvailableVariant := false
				for _, oldProd := range lastProductList.Products {
					if oldProd.ID == prod.ID {
						isNewProduct = false
						for _, variant := range prod.Variants {
							if !variant.Available {
								continue
							}
							hasAvailableVariant = true
							isNewVariant := true
							for _, oldVariant := range oldProd.Variants {
								if variant.ID == oldVariant.ID && oldVariant.Available {
									isNewVariant = false
									break
								}
							}
							if isNewVariant {
								isRestock = true
							}
						}
					}
				}
				if isRestock {
					log.Printf("[SHOPIFY] (%s) Restock: %s - %d\n", site.URL, prod.Title, time.Now().UnixMilli()-currentTime)
					embeds = append(embeds, getProductEmbed("Restock", prod, site))
				}
				if isNewProduct && hasAvailableVariant {
					log.Printf("[SHOPIFY] (%s) New Product: %s - %d\n", site.URL, prod.Title, time.Now().UnixMilli()-currentTime)
					embeds = append(embeds, getProductEmbed("New Product", prod, site))
				}
			}

			// lastJSONString = prodJSONString
			lastProductList = prodList
		}

		fasthttp.ReleaseRequest(req)
		fasthttp.ReleaseResponse(resp)

		if len(embeds) > 0 { // Finally compile and distribute these restock/new product embeds as a single hook
			go sendEmbeds(site.Webhook, embeds)
		}

		// time.Sleep(500 * time.Millisecond)
	}
}
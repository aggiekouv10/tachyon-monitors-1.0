package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

func Monitor(site *Site) {
	var lastProductList ProductList
	// var lastJSONString string
	passwordPage := "UNKNOWN"

	var embeds []string
	for {
		embeds = nil
		site.RotateProxy()

		currentTime := time.Now().UnixMilli()
		_ = currentTime
		order := rand.Int()
		q := rand.Int()
		siteURL := fmt.Sprintf("%s/products.json?limit=50&order=%d&q=%d", site.URL, order, q)
		req, err := http.NewRequest("GET", siteURL, nil)
		if err != nil {
			log.Fatalf("Could not create request object %s\n%s", siteURL, err)
		}
		req.Header.Set("Sec-Ch-Ua", "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"90\", \"Google Chrome\";v=\"90\"")
		req.Header.Set("Sec-Ch-Ua-Mobile", "?0")
		req.Header.Set("Upgrade-Insecure-Requests", "1")
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36")
		req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
		req.Header.Set("Sec-Fetch-Site", "none")
		req.Header.Set("Sec-Fetch-Mode", "navigate")
		req.Header.Set("Sec-Fetch-User", "?1")
		req.Header.Set("Sec-Fetch-Dest", "document")
		req.Header.Set("Accept-Language", "en-US,en;q=0.9")

		resp, err := site.Client.Do(req)
		if err != nil {
			if strings.Contains(err.Error(), "Timeout exceeded") {
				log.Printf("[SHOPIFY] Timeout (%s) - %s\n", site.URL, site.CurrentProxy)
			} else {
				log.Printf("[SHOPIFY] ERR - %s - %s\n", siteURL, site.CurrentProxy)
				log.Fatalln(err.Error())
			}
			continue
		}

		prodJSONBytes, err := ioutil.ReadAll(resp.Body)
		resp.Body.Close()
		if resp.StatusCode != 200 { // Handle non 200 responses
			if resp.StatusCode == 429 {
				log.Printf("[SHOPIFY] 429 (%s)", site.URL)

			} else if resp.StatusCode == 500 {
				log.Printf("[SHOPIFY] 500 (%s)", site.URL)

			} else if resp.StatusCode == 401 { // When response is 401 (unauthorized), its a password page block.
				if passwordPage == "DOWN" {
					log.Printf("[SHOPIFY] Password Page UP (%s)\n", site.URL)
					go getPasswordHook("UP", site)
				}
				passwordPage = "UP"
			} else {
				log.Printf("[SHOPIFY] UNHANDLED STATUS CODE (%d) - %s - %s", resp.StatusCode, site.URL, site.CurrentProxy)
				log.Fatalln(err)
			}

		} else { // It's a succesfull 200 response code

			// Handle Password Page Status
			if passwordPage == "UP" {
				log.Printf("[SHOPIFY] Password Page DOWN (%s)\n", site.URL)
				go getPasswordHook("DOWN", site)
			}
			passwordPage = "DOWN"

			var prodList ProductList
			json.Unmarshal(prodJSONBytes, &prodList)

			// log.Println(string(prodJSONString))
			if len(prodList.Products) == 0 {
				// fmt.Println(string(prodJSONBytes))
				// fmt.Println(resp.Header)
				// log.Fatalln(resp.StatusCode)
				if time.Now().UnixMilli()-currentTime >= site.Timeout {
					log.Printf("[SHOPIFY] Timeout (%s) - %s\n", site.URL, site.CurrentProxy)
					continue
				}
				log.Printf("[SHOPIFY] (%s) %d - %d - %s\n", site.URL, len(prodList.Products), time.Now().UnixMilli()-currentTime, site.CurrentProxy)
				continue
			}
			// log.Printf("[SHOPIFY] (%s) %d - %d - %s\n", site.URL, len(prodList.Products), time.Now().UnixMilli()-currentTime, site.CurrentProxy)
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
				for _, oldProd := range lastProductList.Products {
					if oldProd.ID == prod.ID {
						isNewProduct = false
						for _, variant := range prod.Variants {
							if !variant.Available {
								continue
							}
							isNewVariant := true
							for _, oldVariant := range oldProd.Variants {
								if variant.ID == oldVariant.ID && oldVariant.Available {
									isNewVariant = false
									break
								}
							}
							if isNewVariant {
								log.Printf("[SHOPIFY] (%s) Restock: %s - %d\n", site.URL, prod.Title, time.Now().UnixMilli()-currentTime)
								embeds = append(embeds, getProductEmbed("Restock", prod, site))
							}
						}
					}
				}
				if isNewProduct {
					log.Printf("[SHOPIFY] (%s) New Product: %s - %d\n", site.URL, prod.Title, time.Now().UnixMilli()-currentTime)
					embeds = append(embeds, getProductEmbed("New Product", prod, site))
				}
			}

			// lastJSONString = prodJSONString
			lastProductList = prodList
		}

		if len(embeds) > 0 { // Finally compile and distribute these restock/new product embeds as a single hook
			go distributeEmbeds(embeds)
		}
	}
}

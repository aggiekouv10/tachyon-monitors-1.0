package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"
)

func getProductEmbedB(restockType string, product Product, site *Site) string {
	log.Printf("[SHOPIFY] %s (%s) - %s\n", restockType, site.URL, product.Title)
	log.Println(product.Handle)
	log.Println(product.Images[0].SRC)
	for _, variant := range product.Variants {
		log.Println(variant.Title)
	}
	price := "NA"
	if len(product.Variants) > 0 && product.Variants[0].Price != "" {
		price = product.Variants[0].Price
	}
	jsonString := fmt.Sprintf(`{"title": "%s","url": "%s","color": 7123939,"fields": [{"name": "Type","value": "%s"},{"name": "Price",	"value": "%s"}`, product.Title, site.URL+"/"+product.Handle, restockType, price)

	for i := 0; i < len(product.Variants); i += 2 {
		hyperlink1 := fmt.Sprintf("%s/cart/%d:1", site.URL, product.Variants[i].ID)
		var hyperlink2 string
		if i+1 < len(product.Variants) {
			hyperlink2 = fmt.Sprintf("%s/cart/%d:1", site.URL, product.Variants[i+1].ID)
			jsonString += fmt.Sprintf(`,{"name": "sizes","value": "[%s](%s) | [QT](%s)\n[%s](%s) | [QT](%s)","inline": true}`, product.Variants[i].Title, hyperlink1, "https://qt.tachyonrobotics.com/?url="+hyperlink1, product.Variants[i+1].Title, hyperlink2, "https://qt.tachyonrobotics.com/?url="+hyperlink2)
		} else {
			jsonString += fmt.Sprintf(`,{"name": "sizes","value": "[%s](%s) | [QT](%s)","inline": true}`, product.Variants[i].Title, hyperlink1, "https://qt.tachyonrobotics.com/?url="+hyperlink1)
		}
	}

	t := time.Now()
	stamp := fmt.Sprintf("%d:%d:%d", t.Hour(), t.Minute(), t.Second())
	image := "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829"
	if len(product.Images) > 0 && product.Images[0].SRC != "" {
		image = product.Images[0].SRC
	}
	jsonString += fmt.Sprintf(`],"author": {"name": "%s","url": "%s"},"footer": {"text": "Shopify | v1.0  •  %s UTC","icon_url": "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829"},"thumbnail": {"url": "%s"}}`, site.URL, site.URL, stamp, image)

	return jsonString
}

func getProductEmbed(restockType string, product Product, site *Site) string {
	// log.Printf("[SHOPIFY] %s (%s) - %s\n", restockType, site.URL, product.Title)
	// log.Println(product.Handle)
	// log.Println(product.Images[0].SRC)
	// for _, variant := range product.Variants {
	// 	log.Println(variant.Title)
	// }
	price := "NA"
	if len(product.Variants) > 0 && product.Variants[0].Price != "" {
		price = product.Variants[0].Price
	}
	jsonString := fmt.Sprintf(`
		  {
			"title": "%s",
			"url": "%s",
			"color": 7123939,
			"fields": [
			  {
				"name": "Type",
				"value": "%s"
			  },
			  {
				"name": "Price",
				"value": "%s"
			  }`, product.Title, site.URL+"/"+product.Handle, restockType, price)

	var inStockVariants []Variant
	for i := 0; i < len(product.Variants); i++ {
		if product.Variants[i].Available {
			inStockVariants = append(inStockVariants, product.Variants[i])
		}
	}
	for i := 0; i < len(inStockVariants); i += 2 {
		hyperlink1 := fmt.Sprintf("%s/cart/%d:1", site.URL, inStockVariants[i].ID)
		var hyperlink2 string
		if i+1 < len(inStockVariants) {
			hyperlink2 = fmt.Sprintf("%s/cart/%d:1", site.URL, inStockVariants[i+1].ID)
			jsonString += fmt.Sprintf(`
			  ,{
				"name": "sizes",
				"value": "[%s](%s) | [QT](%s)\n[%s](%s) | [QT](%s)",
				"inline": true
			  }`, inStockVariants[i].Title, hyperlink1, "https://qt.tachyonrobotics.com/?url="+hyperlink1, inStockVariants[i+1].Title, hyperlink2, "https://qt.tachyonrobotics.com/?url="+hyperlink2)
		} else {
			jsonString += fmt.Sprintf(`
			  ,{
				"name": "sizes",
				"value": "[%s](%s) | [QT](%s)",
				"inline": true
			  }`, inStockVariants[i].Title, hyperlink1, "https://qt.tachyonrobotics.com/?url="+hyperlink1)
		}
	}

	t := time.Now()
	stamp := fmt.Sprintf("%d:%d:%d", t.Hour(), t.Minute(), t.Second())
	image := "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829"
	if len(product.Images) > 0 && product.Images[0].SRC != "" {
		image = product.Images[0].SRC
	}
	jsonString += fmt.Sprintf(`],
			"author": {
			  "name": "%s",
			  "url": "%s"
			},
			"footer": {
			  "text": "Shopify | v1.0  •  %s UTC",
			  "icon_url": "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829"
			},
			"thumbnail": {
			  "url": "%s"
			}
		  }`, site.URL, site.URL, stamp, image)

	return jsonString
}

func getPasswordHook(status string, site *Site) {

}

func getCheckpointHook() {

}

func distributeEmbedsB(embeds []string) {
	embedArray := embeds[0]
	for i := 1; i < len(embeds); i++ {
		embedArray += `,` + embeds[i]
	}
	jsonString := `{"content": null,"embeds": [` + embedArray + `],"username": "Tachyon Monitors","avatar_url": "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829"}`
	fmt.Println(jsonString)
}

func distributeEmbeds(embeds []string) {
	webhooks := []string{}
	embedArray := embeds[0]
	totalLength := len(embeds[0])
	log.Println(len(embeds[0]))
	for i := 1; i < len(embeds); i++ {
		totalLength += len(embeds[i])
		if totalLength > 10003 {
			log.Println("This webhook wont go through")
		}
		log.Println(len(embeds[i]))
		embedArray += `,` + embeds[i]
	}
	jsonString := `{
		"content": null,
		"embeds": [` + embedArray + `],
	"username": "Tachyon Monitors",
	"avatar_url": "https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829"
  }`
	webhooks = append(webhooks, jsonString)
	// fmt.Println(jsonString)

	for _, webhook := range webhooks {

		req, err := http.NewRequest("POST", "https://discord.com/api/webhooks/858170629404622848/70YgNy6X274KkOZyBomETD0bbVaEzAAAcHlATfrQXQrsgGyGs1riJBOYFryux1zLz7jK", bytes.NewBuffer([]byte(webhook)))
		// req.Header.Set("X-Custom-Header", "myvalue")
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			panic(err)
		}
		defer resp.Body.Close()

		// fmt.Println(webhook)
		// log.Println(totalLength)
		log.Println("response Status:", resp.Status)
		body, _ := ioutil.ReadAll(resp.Body)
		log.Println("response Body:", string(body))
	}
}

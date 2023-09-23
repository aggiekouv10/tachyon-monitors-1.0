package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"sync"
	"time"
)

var proxies []string

func main() {
	rand.Seed(time.Now().UnixNano())
	var wg sync.WaitGroup

	proxiesFile, err := os.Open("../proxiesFormatted.json")
	// if we os.Open returns an error then handle it
	if err != nil {
		log.Fatalln(err)
	}
	log.Println("[SHOPIFY] opened proxiesFormatted.json")
	// defer the closing of our jsonFile so that we can parse it later on
	defer proxiesFile.Close()
	byteValue, _ := ioutil.ReadAll(proxiesFile)
	json.Unmarshal([]byte(byteValue), &proxies)
	// Load the proxies into RoundTrippers (Transports)
	GenerateProxies()

	var sitesFile *os.File
	sitesFile, err = os.Open("../sites.json")

	if err != nil {
		log.Fatalln(err)
	}
	log.Println("[SHOPIFY] opened sites.json")
	defer sitesFile.Close()
	byteValue, _ = ioutil.ReadAll(sitesFile)
	var sites []Site
	json.Unmarshal([]byte(byteValue), &sites)
	totalSites := len(sites)
	log.Printf("[SHOPIFY] Loaded %d sites!\n", totalSites)

	for i := 0; i < totalSites; i++ {

		sites[i].Client, _ = NewClient(30000 * time.Millisecond)
		sites[i].Timeout = 30000

		wg.Add(1)
		go Monitor(&sites[i])
	}

	wg.Wait()
}

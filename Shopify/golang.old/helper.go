package main

import (
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"time"
)

type Site struct {
	URL     string `json:"url"`
	Webhook string `json:"webhook"`

	ProductJSON ProductList

	Timeout      int64
	CurrentProxy string
	Client       *http.Client
}

var Transports []*http.Transport

func GenerateProxies() {
	for _, proxy := range proxies {
		proxyURL, _ := url.Parse(proxy)
		tr := &http.Transport{Proxy: http.ProxyURL(proxyURL)}
		Transports = append(Transports, tr)
	}
}

func NewClient(timeout time.Duration) (*http.Client, error) {
	return &http.Client{}, nil
}

// func newRoundTripper(raw string) (*http.Transport, error) {
// 	proxyURL, err := url.Parse(raw)

// 	if err != nil {
// 		log.Fatalf("Failed to load proxy %s\n%s", proxyURL, err)
// 	}

// 	tr := &http.Transport{Proxy: http.ProxyURL(proxyURL)}
// 	// Use the following only for HTTP/2
// 	// err = http2.ConfigureTransport(tr)
// 	return tr, nil
// }

func (site *Site) RotateProxy() {
	var roundTripper http.RoundTripper
	var err error
	if len(proxies) > 0 {
		randomInt := rand.Intn(len(proxies))
		proxyURL := proxies[randomInt]
		roundTripper, err = Transports[randomInt], nil //newRoundTripper(proxyURL)
		if err != nil {
			log.Fatalf("Failed to rotate proxy %s\n%s", proxyURL, err)
		}
		site.CurrentProxy = proxyURL
		site.Client.Transport = roundTripper
	}
}

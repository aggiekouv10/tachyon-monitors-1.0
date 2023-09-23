package main

import (
	"bufio"
	"encoding/base64"
	"fmt"
	"log"
	"math/rand"
	"net"
	"os"
	"os/signal"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/valyala/fasthttp"
)

type Site struct {
	URL     string `json:"url"`
	Webhook string `json:"webhook"`

	ProductJSON ProductList

	Timeout      int64 `json:"timeout"`
	CurrentProxy string
	Client       *fasthttp.Client
}

var websocketConn *websocket.Conn

func ConnectWebsocket() {
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	wsURL := "ws://127.0.0.1:8080/ws?name=Shopify"
	var err error
	websocketConn, _, err = websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		log.Println("Could not connect to websocket!")
		log.Fatalln(err)
	}

	done := make(chan struct{})

	go func() {
		defer close(done)
		for {
			_, message, err := websocketConn.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				return
			}
			log.Printf("recv: %s", message)
		}
	}()

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			return
		case t := <-ticker.C:
			err := websocketConn.WriteMessage(websocket.TextMessage, []byte(t.String()))
			if err != nil {
				log.Println("write:", err)
				return
			}
		case <-interrupt:
			log.Println("interrupt")

			// Cleanly close the connection by sending a close message and then
			// waiting (with timeout) for the server to close the connection.
			err := websocketConn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				log.Println("write close:", err)
				return
			}
			select {
			case <-done:
			case <-time.After(time.Second):
			}
			return
		}
	}
}

// var Clients []*fasthttp.Client

// func GenerateProxies() {
// 	for _, proxy := range proxies {
// 		client := &fasthttp.Client{Dial: FasthttpHTTPDialer(proxy)}
// 		Clients = append(Clients, client)
// 	}
// }

func NewClient(timeout time.Duration) (*fasthttp.Client, error) {
	return &fasthttp.Client{MaxConnWaitTimeout: timeout}, nil
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
	if len(proxies) > 0 {
		proxyURL := proxies[rand.Intn(len(proxies))]
		site.Client = &fasthttp.Client{Dial: FasthttpHTTPDialer(proxyURL)}
		site.CurrentProxy = proxyURL
	} else {
		log.Fatalln("NO PROXY AVAILABLE")
	}
}

func FasthttpHTTPDialer(proxy string) fasthttp.DialFunc {
	return func(addr string) (net.Conn, error) {
		var auth string
		proxy = strings.ReplaceAll(proxy, "http://", "")
		if strings.Contains(proxy, "@") {
			split := strings.Split(proxy, "@")
			auth = base64.StdEncoding.EncodeToString([]byte(split[0]))
			proxy = split[1]
		}
		conn, err := fasthttp.Dial(proxy)
		if err != nil {
			return nil, err
		}
		req := "CONNECT " + addr + " HTTP/1.1\r\n"
		if auth != "" {
			req += "Proxy-Authorization: Basic " + auth + "\r\n"
		}
		req += "\r\n"
		if _, err := conn.Write([]byte(req)); err != nil {
			return nil, err
		}
		res := fasthttp.AcquireResponse()
		defer fasthttp.ReleaseResponse(res)
		res.SkipBody = true
		if err := res.Read(bufio.NewReader(conn)); err != nil {
			conn.Close()
			return nil, err
		}
		if res.Header.StatusCode() != 200 {
			conn.Close()
			return nil, fmt.Errorf("could not connect to proxy")
		}
		return conn, nil
	}
}

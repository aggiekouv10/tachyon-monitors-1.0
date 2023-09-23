package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

func hmac256(message string, secret string) string {
    key := []byte(secret)
    h := hmac.New(sha256.New, key)
    h.Write([]byte(message))
    return hex.EncodeToString(h.Sum(nil))
}

func TokenGen() string {
    key := []byte{142, 167, 155, 206, 195, 213, 69, 151, 239, 225, 134, 120, 10, 131, 92, 7, 84, 0, 98, 58, 17, 72, 29, 61, 23, 221, 146, 233, 5, 219, 182, 21}

    startTime := (time.Now().Unix() - 300000)
    expTime := (time.Now().Unix() + 1800000)

    data := "st=" + string(startTime) + "~exp=" + string(expTime) + "~acl=*"

    string := hmac256(data, string(key))

    return data + "~hmac=" + string

}

func main() {
  fmt.Println(TokenGen())
}
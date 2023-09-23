package main

type ProductList struct {
	Products []Product `json:"products"`
}

type Product struct {
	ID     int64  `json:"id"`
	Title  string `json:"title"`
	Handle string `json:"handle"`

	Variants []Variant `json:"variants"`
	Images   []Image   `json:"images"`
}
type Variant struct {
	ID        int64  `json:"id"`
	Title     string `json:"title"`
	SKU       string `json:"sku"`
	Price     string `json:"price"`
	Available bool   `json:"available"`
}

type Image struct {
	SRC string `json:"src"`
}

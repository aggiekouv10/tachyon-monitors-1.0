const fs = require('fs');
const fetch = require('node-fetch');
const HTTPSProxyAgent = require('https-proxy-agent')
const randomUseragent = require('random-useragent');
const database = require('../database/database')
const webhook = require("webhook-discord");
const { default: axios } = require('axios');
const got = require('got')
const Discord = require('discord.js');
const discordBot = require('../discord-bot');
const discordWebhook = new webhook.Webhook(discordBot.webhooks.WALMARTUS);
const fbhhook = new webhook.Webhook('https://discord.com/api/webhooks/889548324628201583/Jic0MGfVe6nPOVtXKZnnTwJsX8Sqn0t7-MNggBKN_v9XPKoCISox1zEcaeZ1tmWZn9tp');
const devserver  = new webhook.Webhook('https://discord.com/api/webhooks/814493251678765057/Cua-kQhOYfTrfBzu1fEumgmMlJoTtMe0EajqiPhEpfCp7RXYLw3H5LFnBm-nva_qekcr');
const spacenotify   = new webhook.Webhook('https://discord.com/api/webhooks/889746546021761044/eJjzzhcUGVVunAzugPnt5Y1yg3zr-VsnxTpudGQqBHno7Zp5bxj7HfVtWuLkeC74TLtw');
const CHANNEL = discordBot.channels.WALMARTUS;
const helper = require('../helper');
const { HttpsProxyAgent } = require('hpagent')
const DATABASE_TABLE = 'walmartus';
const { v4 } = require('uuid');
let totalData = 0;
let CAPTCHA = [];
let PRODUCTS = {}
let useragent = ''
let cookie = ''


let EXCLUDED_PROXIES = require('../walmartExcludedProxies.json');//[]

startMonitoring();
async function startMonitoring() {
    let SKUList = await database.query(`SELECT * from ${DATABASE_TABLE}`);
    for (let row of SKUList.rows) {
        PRODUCTS[row.sku] = {
            sku: row.sku,
            waittime: row.waittime,
            status: row.status
        }
        // console.log(PRODUCTS[row.sku])
        monitor(row.sku);
    }
    console.log('[WALMART-US] Monitoring all SKUs!')
}
async function monitor(sku, proxy = getProxy(), cookie = '', useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36') {
    let url = `https://www.walmart.com/ip/tachyon/${sku}`;
    async function pxgen() {
        let response = await got('https://slapio.com/px/gen', {
            method: "POST",
            headers: {
                'authkey': 'aggie-header-key-thxbb'
            },
            form: {
                proxy: proxy,
                key: 'thx-4-monitor'
            },
            
            retry: 0
        })
        let body2 = await response.body
        body2 = await JSON.parse(body2)
        let useragent = body2.result.useragent
        let cookie2 = '_px3=' + body2.result._px3 + '; _pxvid='+ body2.result.vid + 'com.wm.reflector=reflectorid:0000000000000000000000;'
        console.log("PX Cookie")
        monitor(sku, proxy, cookie2, useragent);
        return;
    }
    let productCache = PRODUCTS[sku]
    if (!productCache)
        return;
        got(`https://www.walmart.com/orchestra/home/graphql/ip/${sku}`, {
            method: "POST",
            headers: {
                    'X-APOLLO-OPERATION-NAME': 'ItemById', 
                    'sec-ch-ua': '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"', 
                    'Accept': 'application/vnd.nord.pdp.v1+json',
                    'x-o-item-id': sku, 
                    'x-latency-trace': '1', 
                    'WM_MP': 'true', 
                    'x-o-platform-version': 'main-95-173f44', 
                    'x-o-segment': 'oaoh', 
                    'callType': 'CLIENT', 
                    'x-o-gql-query': 'query ItemById',
                    'sec-ch-ua-platform': '"Windows"', 
                    'sec-ch-ua-mobile': '?0', 
                    'x-o-platform': 'rweb', 
                    'Content-Type': 'application/json', 
                    'is-variant-fetch': 'false', 
                    'x-enable-server-timing': '1', 
                    'x-o-ccm': 'server',
                    'User-Agent': useragent, 
                    'Cookie': cookie,
            },
            json:  {"query":"query ItemById( $itemId:String! $selected:Boolean $variantFieldId:String $postalAddress:PostalAddress $storeFrontIds:[StoreFrontId]$page:Int $sort:String $limit:Int $filters:[String]$channel:String! $pageType:String! $tenant:String! $version:String! $p13N:P13NRequest $p13nCls:JSON $layout:[String]$tempo:JSON $semStoreId:Int $catalogSellerId:String $fetchBuyBoxAd:Boolean! $fetchMarquee:Boolean! $fetchSkyline:Boolean! $fetchSpCarousel:Boolean! $fulfillmentIntent:String ){contentLayout( channel:$channel pageType:$pageType tenant:$tenant version:$version ){modules(p13n:$p13nCls tempo:$tempo){configs{...on EnricherModuleConfigsV1{zoneV1}...on TempoWM_GLASSWWWItemCarouselConfigsV1{products{...ContentLayoutProduct}subTitle tileOptions{addToCart averageRatings displayAveragePriceCondition displayPricePerUnit displayStandardPrice displayWasPrice fulfillmentBadging mediaRatings productFlags productLabels productPrice productTitle}title type spBeaconInfo{adUuid moduleInfo pageViewUUID placement max}viewAllLink{linkText title uid}}...on TempoWM_GLASSWWWItemFitmentModuleConfigs{fitment{partTypeID partTypeIDs result{status notes position formId quantityTitle resultSubTitle suggestions{id position loadIndex speedRating searchQueryParam labels{...FitmentLabel}fitmentSuggestionParams{id value}cat_id}extendedAttributes{...FitmentFieldFragment}labels{...FitmentLabel}}labels{...FitmentLabel}savedVehicle{...FitmentVehicleFragment}}}...on TempoWM_GLASSWWWItemRelatedShelvesConfigs{seoItemRelmData(id:$itemId){relm{id url name}}}...on TempoWM_GLASSWWWCapitalOneBannerConfigsV1{bannerBackgroundColor primaryImage{alt src}bannerCta{ctaLink{linkText title clickThrough{value}uid}textColor}bannerText{text isBold isUnderlined underlinedColor textColor}}...on TempoWM_GLASSWWWProductWarrantyPlaceholderConfigs{expandedOnPageLoad}...on TempoWM_GLASSWWWGeneralWarningsPlaceholderConfigs{expandedOnPageLoad}...on TempoWM_GLASSWWWProductIndicationsPlaceholderConfigs{expandedOnPageLoad}...on TempoWM_GLASSWWWProductDescriptionPlaceholderConfigs{expandedOnPageLoad}...on TempoWM_GLASSWWWProductDirectionsPlaceholderConfigs{expandedOnPageLoad}...on TempoWM_GLASSWWWProductSpecificationsPlaceholderConfigs{expandedOnPageLoad}...on TempoWM_GLASSWWWNutritionValuePlaceholderConfigs{expandedOnPageLoad}...on TempoWM_GLASSWWWReviewsPlaceholderConfigs{expandedOnPageLoad}...on TempoWM_GLASSWWWProductDescriptionPlaceholderConfigs{expandedOnPageLoad}...BuyBoxAdConfigsFragment @include(if:$fetchBuyBoxAd)...MarqueeDisplayAdConfigsFragment @include(if:$fetchMarquee)...SkylineDisplayAdConfigsFragment @include(if:$fetchSkyline)...SponsoredProductCarouselConfigsFragment @include(if:$fetchSpCarousel)}moduleId matchedTrigger{pageType pageId zone inheritable}name type version status publishedDate}layouts(layout:$layout){id layout}pageMetadata{location{postalCode stateOrProvinceCode city storeId}pageContext}}product( catalogSellerId:$catalogSellerId itemId:$itemId postalAddress:$postalAddress storeFrontIds:$storeFrontIds selected:$selected semStoreId:$semStoreId p13N:$p13N variantFieldId:$variantFieldId fulfillmentIntent:$fulfillmentIntent ){...FullProductFragment}idml(itemId:$itemId html:true){...IDMLFragment}reviews( itemId:$itemId page:$page limit:$limit sort:$sort filters:$filters ){...FullReviewsFragment}}fragment FullProductFragment on Product{showFulfillmentLink additionalOfferCount shippingRestriction availabilityStatus averageRating brand badges{...BadgesFragment}rhPath partTerminologyId aaiaBrandId manufacturerProductId productTypeId tireSize tireLoadIndex tireSpeedRating viscosity model buyNowEligible preOrder{...PreorderFragment}canonicalUrl catalogSellerId sellerReviewCount sellerAverageRating category{...ProductCategoryFragment}classType classId fulfillmentTitle shortDescription fulfillmentType fulfillmentBadge fulfillmentLabel{wPlusFulfillmentText message shippingText fulfillmentText locationText fulfillmentMethod addressEligibility fulfillmentType postalCode}hasSellerBadge itemType id imageInfo{...ProductImageInfoFragment}location{postalCode stateOrProvinceCode city storeIds}manufacturerName name numberOfReviews orderMinLimit orderLimit offerId priceInfo{priceDisplayCodes{...PriceDisplayCodesFragment}currentPrice{...ProductPriceFragment}wasPrice{...ProductPriceFragment}unitPrice{...ProductPriceFragment}subscriptionPrice{price priceString intervalFrequency duration percentageRate subscriptionString}priceRange{minPrice maxPrice priceString currencyUnit unitOfMeasure denominations{price priceString selected}}}returnPolicy{returnable freeReturns returnWindow{value unitType}}fsaEligibleInd sellerId sellerName sellerDisplayName secondaryOfferPrice{currentPrice{priceType priceString price}}semStoreData{pickupStoreId deliveryStoreId isSemLocationDifferent}shippingOption{...ShippingOptionFragment}type pickupOption{slaTier accessTypes availabilityStatus storeName storeId}salesUnit usItemId variantCriteria{id categoryTypeAllValues name type variantList{availabilityStatus id images name products swatchImageUrl selected}}variants{...MinimalProductFragment}groupMetaData{groupType groupSubType numberOfComponents groupComponents{quantity offerId componentType}}upc wfsEnabled sellerType ironbankCategory snapEligible promoData{id description terms type templateData{priceString imageUrl}}showAddOnServices addOnServices{serviceType serviceTitle serviceSubTitle groups{groupType groupTitle assetUrl shortDescription services{displayName offerId selectedDisplayName currentPrice{price priceString}}}}productLocation{displayValue}}fragment BadgesFragment on UnifiedBadge{flags{__typename...on BaseBadge{id text key query}...on PreviouslyPurchasedBadge{id text key lastBoughtOn numBought criteria{name value}}}labels{__typename...on BaseBadge{id text key}...on PreviouslyPurchasedBadge{id text key lastBoughtOn numBought}}tags{__typename...on BaseBadge{id text key}}}fragment ShippingOptionFragment on ShippingOption{accessTypes availabilityStatus slaTier deliveryDate maxDeliveryDate shipMethod shipPrice{...ProductPriceFragment}}fragment ProductCategoryFragment on ProductCategory{categoryPathId path{name url}}fragment PreorderFragment on PreOrder{streetDate streetDateDisplayable streetDateType isPreOrder preOrderMessage preOrderStreetDateMessage}fragment MinimalProductFragment on Variant{availabilityStatus imageInfo{...ProductImageInfoFragment}priceInfo{priceDisplayCodes{...PriceDisplayCodesFragment}currentPrice{...ProductPriceFragment}wasPrice{...ProductPriceFragment}unitPrice{...ProductPriceFragment}}productUrl usItemId id:productId fulfillmentBadge}fragment ProductImageInfoFragment on ProductImageInfo{allImages{id url zoomable}thumbnailUrl}fragment PriceDisplayCodesFragment on PriceDisplayCodes{clearance eligibleForAssociateDiscount finalCostByWeight hidePriceForSOI priceDisplayCondition pricePerUnitUom reducedPrice rollback strikethrough submapType unitOfMeasure unitPriceDisplayCondition}fragment ProductPriceFragment on ProductPrice{price priceString variantPriceString priceType currencyUnit}fragment NutrientFragment on Nutrient{name amount dvp childNutrients{name amount dvp}}fragment NutritionAttributeFragment on NutritionAttribute{name mainNutrient{...NutrientFragment}childNutrients{...NutrientFragment childNutrients{...NutrientFragment}}}fragment IdmlAttributeFragment on IdmlAttribute{name value attribute}fragment ServingAttributeFragment on ServingAttribute{name values{...IdmlAttributeFragment values{...IdmlAttributeFragment}}}fragment IDMLFragment on Idml{chokingHazards{...LegalContentFragment}directions{name value}indications{name value}ingredients{activeIngredientName{name value}activeIngredients{name value}inactiveIngredients{name value}ingredients{name value}}longDescription shortDescription interactiveProductVideo specifications{name value}warnings{name value}warranty{information length}esrbRating mpaaRating nutritionFacts{calorieInfo{...NutritionAttributeFragment}keyNutrients{name values{...NutritionAttributeFragment}}vitaminMinerals{...NutritionAttributeFragment}servingInfo{...ServingAttributeFragment}additionalDisclaimer{...IdmlAttributeFragment values{...IdmlAttributeFragment values{...IdmlAttributeFragment}}}staticContent{...IdmlAttributeFragment values{...IdmlAttributeFragment values{...IdmlAttributeFragment}}}}}fragment FullReviewsFragment on ProductReviews{averageOverallRating customerReviews{...CustomerReviewsFragment}ratingValueFiveCount ratingValueFourCount ratingValueOneCount ratingValueThreeCount ratingValueTwoCount roundedAverageOverallRating topNegativeReview{rating reviewSubmissionTime negativeFeedback positiveFeedback reviewText reviewTitle}topPositiveReview{rating reviewSubmissionTime negativeFeedback positiveFeedback reviewText reviewTitle}totalReviewCount}fragment LegalContentFragment on LegalContent{ageRestriction headline headline image mature message}fragment CustomerReviewsFragment on CustomerReview{rating reviewSubmissionTime reviewText reviewTitle userNickname}fragment ContentLayoutProduct on Product{name badges{...BadgesFragment}canonicalUrl classType availabilityStatus showAtc averageRating fulfillmentBadge fulfillmentSpeed fulfillmentTitle fulfillmentType imageInfo{thumbnailUrl}numberOfReviews offerId orderMinLimit orderLimit p13nDataV1{predictedQuantity flags{PREVIOUSLY_PURCHASED{text}CUSTOMERS_PICK{text}}}previouslyPurchased{label}preOrder{...PreorderFragment}priceInfo{currentPrice{...ProductPriceFragment}listPrice{...ProductPriceFragment}subscriptionPrice{priceString}priceDisplayCodes{clearance eligibleForAssociateDiscount finalCostByWeight hidePriceForSOI priceDisplayCondition pricePerUnitUom reducedPrice rollback strikethrough submapType unitOfMeasure unitPriceDisplayCondition}priceRange{minPrice maxPrice priceString}unitPrice{...ProductPriceFragment}wasPrice{...ProductPriceFragment}}rhPath salesUnit sellerId sellerName hasSellerBadge seller{name sellerId}shippingOption{slaTier shipMethod}showOptions snapEligible sponsoredProduct{spQs clickBeacon spTags}usItemId variantCount variantCriteria{name id variantList{name swatchImageUrl selectedProduct{usItemId canonicalUrl}}}}fragment FitmentLabel on FitmentLabels{links{...FitmentLabelEntity}messages{...FitmentLabelEntity}ctas{...FitmentLabelEntity}images{...FitmentLabelEntity}}fragment FitmentVehicleFragment on FitmentVehicle{vehicleYear{...FitmentVehicleFieldFragment}vehicleMake{...FitmentVehicleFieldFragment}vehicleModel{...FitmentVehicleFieldFragment}additionalAttributes{...FitmentVehicleFieldFragment}}fragment FitmentVehicleFieldFragment on FitmentVehicleField{id value label}fragment FitmentFieldFragment on FitmentField{id value displayName data{value label}extended dependsOn}fragment FitmentLabelEntity on FitmentLabelEntity{id label}fragment BuyBoxAdConfigsFragment on TempoWM_GLASSWWWBuyBoxAdConfigs{_rawConfigs moduleLocation lazy ad{...SponsoredProductsAdFragment}}fragment MarqueeDisplayAdConfigsFragment on TempoWM_GLASSWWWMarqueeDisplayAdConfigs{_rawConfigs ad{...DisplayAdFragment}}fragment DisplayAdFragment on Ad{...AdFragment adContent{type data{__typename...AdDataDisplayAdFragment}}}fragment AdFragment on Ad{status moduleType platform pageId pageType storeId stateCode zipCode pageContext moduleConfigs adsContext adRequestComposite}fragment AdDataDisplayAdFragment on AdData{...on DisplayAd{json status}}fragment SkylineDisplayAdConfigsFragment on TempoWM_GLASSWWWSkylineDisplayAdConfigs{_rawConfigs ad{...SkylineDisplayAdFragment}}fragment SkylineDisplayAdFragment on Ad{...SkylineAdFragment adContent{type data{__typename...SkylineAdDataDisplayAdFragment}}}fragment SkylineAdFragment on Ad{status moduleType platform pageId pageType storeId stateCode zipCode pageContext moduleConfigs adsContext adRequestComposite}fragment SkylineAdDataDisplayAdFragment on AdData{...on DisplayAd{json status}}fragment SponsoredProductCarouselConfigsFragment on TempoWM_GLASSWWWSponsoredProductCarouselConfigs{_rawConfigs moduleType ad{...SponsoredProductsAdFragment}}fragment SponsoredProductsAdFragment on Ad{...AdFragment adContent{type data{__typename...AdDataSponsoredProductsFragment}}}fragment AdDataSponsoredProductsFragment on AdData{...on SponsoredProducts{adUuid adExpInfo moduleInfo products{...ProductFragment}}}fragment ProductFragment on Product{usItemId offerId badges{flags{key text}labels{key text}tags{key text}}priceInfo{priceDisplayCodes{rollback reducedPrice eligibleForAssociateDiscount clearance strikethrough submapType priceDisplayCondition unitOfMeasure pricePerUnitUom}currentPrice{price priceString}wasPrice{price priceString}priceRange{minPrice maxPrice priceString}unitPrice{price priceString}}showOptions sponsoredProduct{spQs clickBeacon spTags}canonicalUrl numberOfReviews averageRating availabilityStatus imageInfo{thumbnailUrl allImages{id url}}name fulfillmentBadge classType type p13nData{predictedQuantity flags{PREVIOUSLY_PURCHASED{text}CUSTOMERS_PICK{text}}labels{PREVIOUSLY_PURCHASED{text}CUSTOMERS_PICK{text}}}}",
                    "variables":{
                       "itemId": sku,
                       "selected":true,
                       "channel":"WWW",
                       "pageType":"ItemPageGlobal",
                       "tenant":"WM_GLASS",
                       "version":"v1",
                       "layout":[
                          "itemDesktop"
                       ],
                       "filters":[
                          
                       ],
                       "p13N":{
                          "reqId": v4(),
                          "pageId": sku,
                          "modules":[
                             {
                                "moduleType":"",
                                "moduleId":""
                             }
                          ],
                          "userClientInfo":{
                             "ipAddress":"",
                             "isZipLocated":true,
                             "callType":"CLIENT",
                             "deviceType":"desktop"
                          },
                          "userReqInfo":{
                             "refererContext":{
                                "source":"itempage"
                             },
                             "pageUrl":""
                          }
                       },
                       "p13nCls":{
                          "pageId": sku,
                          "userClientInfo":{
                             "ipAddress":"",
                             "isZipLocated":true,
                             "callType":"CLIENT",
                             "deviceType":"desktop"
                          },
                          "userReqInfo":{
                             "refererContext":{
                                "source":"itempage"
                             }
                          }
                       },
                       "fetchBuyBoxAd":true,
                       "fetchMarquee":true,
                       "fetchSkyline":true,
                       "fetchSpCarousel":true
                    },
                },
            agent: {
                https: new HttpsProxyAgent({
                    keepAlive: true,
                    keepAliveMsecs: 1000,
                    maxSockets: 256,
                    maxFreeSockets: 256,
                    scheduling: 'lifo', 
                    proxy: 'http://geonode_xgWUhR3cKF:13f93252-89d1-4fbb-9a15-acc29810d2d0@rotating-residential.geonode.com:9000'
                })
            },
            responseType: 'json',
            retry: 0
    }).then(async response => {
        clearTimeout(timeoutId)
        let body = await response.body;
        if(body.data.product.sellerId) {
            console.log("PX Cookie Solved")
            if (body.data.product.sellerId === 'F55CDC31AB754BB68FE0B39041159D63') {
                if (body.data.product.availabilityStatus === "IN_STOCK") {
                    let Offerid = body.data.product.offerId
                    let title = body.data.product.name
                    let price = body.data.product.priceInfo.currentPrice.priceString
                    let image = body.data.product.imageInfo.thumbnailUrl

                    if (PRODUCTS[sku].status !== "In-Stock") {
                        postRestockWebhook(url, title, sku, price, image, Offerid);
                        console.log(`[WALMART-US] In Stock! ${sku}`)
                        PRODUCTS[sku].status = 'In-Stock'
                        database.query(`update ${DATABASE_TABLE} set status='In-Stock' where sku='${sku}'`)
                    }
                } else {
                    if (PRODUCTS[sku].status !== "Out-of-Stock") {
                        console.log(`[WALMART-US] OOS! ${sku}`)
                        PRODUCTS[sku].status = 'Out-of-Stock'
                        database.query(`update ${DATABASE_TABLE} set status='Out-of-Stock' where sku='${sku}'`)
                    }
                }
            }
        }
        await helper.sleep(productCache.waittime);
        monitor(sku);
    }).catch(async err => {
        if(err.response && err.response.body.includes('Verify')) {
            pxgen()
            monitor(sku)
            return;
        }
        if(err.response && err.response.code === 'ERR_SOCKET_CLOSED'){
            console.log("[WALMART-US] ERR ERR_SOCKET_CLOSED - " + proxy);
            await helper.sleep(500);
            monitor(sku);
            return;
        }
        if (err.response && err.response.statusCode === 444) {
            console.log("[WALMART-US] ERR 444 - " + proxy);
            EXCLUDED_PROXIES.push(proxy);
            await helper.sleep(500);
            monitor(sku);
            return;
        }
        //console.log("***********WALMART-US-ERROR***********");
        //console.log("SKU: " + sku);
        //console.log("Proxy: " + proxy);
        //console.log(err);
        monitor(sku)
    });
}

async function postRestockWebhook(url, title, sku, price, image, Offerid) {
    let ATC = `https://affil.walmart.com/cart/addToCart?items=${sku}`
    let cart = `https://www.walmart.com/cart`
    let checkout = `https://www.walmart.com/account/checkout`
    let login = `https://www.walmart.com/account/login`
    let phantom = `https://api.ghostaio.com/quicktask/send?site=WALMART&input=${url}`
    let eve = `http://remote.eve-backend.net/api/v2/quick_task?link=${url}`
    let swiftAIO = `https://swftaio.com/pages/quicktask?input=${url}`
    let scottBot = `https://www.scottbotv1.com/quicktask?${url}`
    var webhookMessage = new webhook.MessageBuilder()
        .setName("Tachyon Monitors")
        .setColor("#6cb3e3")
        .setTitle(title)
        .setURL(url)
        .setAuthor('https://www.walmart.com', '', 'https://www.walmart.com')
        .addField("**Sku**", sku, true)
        .addField("**Price**", price, true)
        .addField("**Offer ID**", '```' + Offerid + '```')
        .addField("**Links**", '[ATC](' + ATC + ') | [Cart](' + cart + ') | [Checkout](' + checkout + ') | [Login](' + login + ') | [Phantom](' + phantom + ') | [EVE](' + eve + ') | [SwiftAIO](' + swiftAIO + ') | [ScottBot](' + scottBot + ')')
        .setThumbnail(image)
        .setAvatar("https://cdn.discordapp.com/attachments/871538726491258911/871547773193961502/Shades-01.png")
        // .setTime()
        .setFooter("Walmart US | v2.2.1 • " + helper.getTime(true), 'https://media.discordapp.net/attachments/820804762459045910/821401274053820466/Copy_of_Copy_of_Copy_of_Copy_of_Untitled_5.png?width=829&height=829')
    await discordWebhook.send(webhookMessage);
    await fbhhook.send(webhookMessage);
    await devserver.send(webhookMessage);
    await spacenotify.send(webhookMessage);
}

discordBot.getClient.on('message', async function (msg) {
    if (msg.channel.id !== CHANNEL)
        return;
    if (msg.content.startsWith(discordBot.commandPrefix + 'stats')) {
        discordBot.sendChannelMessage(msg.channel.id, `Successful Requests - ${stats.success}/${stats.total}  [${Number(stats.success * 10000n / stats.total) / 100}%]`);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'captcha')) {
        discordBot.sendChannelMessage(msg.channel.id, `Captcha: ` + CAPTCHA.length);
        return;
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorSKU')) {
        let args = msg.content.split(" ");
        if (args.length !== 3) {
            discordBot.sendChannelMessage(msg.channel.id, "Command: !monitorSKU <SKU> <waitTime>");
            return;
        }
        let sku = args[1];
        let waitTime = args[2];
        let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
        if (query.rows.length > 0) {
            PRODUCTS[sku] = null
            await database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
            discordBot.sendChannelMessage(msg.channel.id, `No longer monitoring SKU '${sku}'!`);
            return;
        }
        PRODUCTS[sku] = {
            sku: sku,
            waittime: waitTime,
            status: ''
        }
        await database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '', ${waitTime})`);
        monitor(sku);
        // console.log("added " + sku)
        discordBot.sendChannelMessage(msg.channel.id, `Started monitoring SKU '${sku}'!  (waitTime ${waitTime})`);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorMultipleSKUs')) {
        let splits = msg.content.split(" ")
        if (splits.length < 2) {
            discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
            return;
        }
        let args = splits[1].split('\n');
        if (!args || args.length < 2) {
            discordBot.sendChannelMessage(msg.channel.id, `Wrong format douchebag`);
            return;
        }
        // console.log(args)
        let waitTime = parseInt(args[0].trim());
        let skus = args.splice(1);
        let monitoringSKUs = [];
        let notMonitoringSKUs = [];
        let errorSKUs = [];
        let tempSKUs = [];
        for (let sku of skus) {
            if (!tempSKUs.includes(sku))
                tempSKUs.push(sku);
        }
        skus = tempSKUs;
        // console.log(skus);
        for (let sku of skus) {
            sku = sku.trim();
            // console.log(sku);
            try {
                if (sku === '')
                    continue;
                let query = await database.query(`SELECT * from ${DATABASE_TABLE} where sku='${sku}'`);
                if (query.rows.length > 0) {
                    PRODUCTS[sku] = null
                    database.query(`delete from ${DATABASE_TABLE} where sku='${sku}'`);
                    notMonitoringSKUs.push(sku);
                    continue;
                }
                PRODUCTS[sku] = {
                    sku: sku,
                    waittime: waitTime,
                    status: ''
                }
                database.query(`insert into ${DATABASE_TABLE}(sku, status, waittime) values('${sku}', '', ${waitTime})`);
                monitor(sku);
                // console.log("added " + sku)
                monitoringSKUs.push(sku);
            }
            catch (err) {
                errorSKUs.push(sku);
                console.log("*********WALMART-US-SKU-ERROR*********");
                console.log("SKU: " + sku);
                console.log(err);
            }
        }
        // console.log(notMonitoringSKUs.length)
        const monitoringMessage = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('Now monitoring')
            .setDescription(monitoringSKUs.join('\n'))
        if (monitoringSKUs.length > 0) msg.reply(monitoringMessage);
        const notMonitoringMessage = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('NOW NOT monitoring')
            .setDescription(notMonitoringSKUs.join('\n'))
        if (notMonitoringSKUs.length > 0) msg.reply(notMonitoringMessage);
        const monitoringErrorMessage = new Discord.MessageEmbed()
            .setColor('#6cb3e3')
            .setTitle('ERROR monitoring')
            .setDescription(errorSKUs.join('\n'))
        if (errorSKUs.length > 0) msg.reply(monitoringErrorMessage);
    }
    if (msg.content.startsWith(discordBot.commandPrefix + 'monitorList')) {
        if (msg.channel.id === CHANNEL) {
            let query = await database.query(`SELECT * from ${DATABASE_TABLE}`);
            const embed = new Discord.MessageEmbed();
            embed.setTitle(`WALMART-US Monitor`);
            embed.setColor('#6cb3e3')
            if (query.rows.length > 0) {
                let SKUList = [];
                for (let row of query.rows) {
                    SKUList.push(`${row.sku}`);
                }
                embed.addField(`**Monitored SKUs** (${SKUList.length})`, SKUList)
            }
            else {
                embed.setDescription("Not Monitoring any SKU!")
            }
            msg.reply(embed);
        }
    }
});

function getProxy() {
    let proxy = helper.getRandomProxy()//PROXIES[a++];
    if (EXCLUDED_PROXIES.includes(proxy))
        return getProxy();
    return proxy;
}

module.exports = {
    totalData: function () {
        return totalData;
    }
}
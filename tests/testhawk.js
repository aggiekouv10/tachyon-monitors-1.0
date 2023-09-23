const Request = require('request');
const fs = require('fs');
const fetch = require('node-fetch');
const Hawk = require('hawk');
const HTTPSProxyAgent = require('https-proxy-agent');
const helper = require('./helper')
helper.init();

let PROXIES = `69.171.212.245:10000
69.171.212.245:10001
69.171.212.245:10002
69.171.212.245:10003
69.171.212.245:10004
69.171.212.245:10005
69.171.212.245:10006
69.171.212.245:10007
69.171.212.245:10008
69.171.212.245:10009
69.171.212.245:10010
69.171.212.245:10011
69.171.212.245:10012
69.171.212.245:10013
69.171.212.245:10014
69.171.212.245:10015
69.171.212.245:10016
69.171.212.245:10017
69.171.212.245:10018
69.171.212.245:10019
69.171.212.245:10020
69.171.212.245:10021
69.171.212.245:10022
69.171.212.245:10023
69.171.212.245:10024
69.171.212.245:10025
69.171.212.245:10026
69.171.212.245:10027
69.171.212.245:10028
69.171.212.245:10029
69.171.212.245:10030
69.171.212.245:10031
69.171.212.245:10032
69.171.212.245:10033
69.171.212.245:10034
69.171.212.245:10035
69.171.212.245:10036
69.171.212.245:10037
69.171.212.245:10038
69.171.212.245:10039
69.171.212.245:10040
69.171.212.245:10041
69.171.212.245:10042
69.171.212.245:10043
69.171.212.245:10044
69.171.212.245:10045
69.171.212.245:10046
69.171.212.245:10047
69.171.212.245:10048
69.171.212.245:10049
69.171.212.245:10050
69.171.212.245:10051
69.171.212.245:10052
69.171.212.245:10053
69.171.212.245:10054
69.171.212.245:10055
69.171.212.245:10056
69.171.212.245:10057
69.171.212.245:10058
69.171.212.245:10059
69.171.212.245:10060
69.171.212.245:10061
69.171.212.245:10062
69.171.212.245:10063
69.171.212.245:10064
69.171.212.245:10065
69.171.212.245:10066
69.171.212.245:10067
69.171.212.245:10068
69.171.212.245:10069
69.171.212.245:10070
69.171.212.245:10071
69.171.212.245:10072
69.171.212.245:10073
69.171.212.245:10074
69.171.212.245:10075
69.171.212.245:10076
69.171.212.245:10077
69.171.212.245:10078
69.171.212.245:10079
69.171.212.245:10080
69.171.212.245:10081
69.171.212.245:10082
69.171.212.245:10083
69.171.212.245:10084
69.171.212.245:10085
69.171.212.245:10086
69.171.212.245:10087
69.171.212.245:10088
69.171.212.245:10089
69.171.212.245:10090
69.171.212.245:10091
69.171.212.245:10092
69.171.212.245:10093
69.171.212.245:10094
69.171.212.245:10095
69.171.212.245:10096
69.171.212.245:10097
69.171.212.245:10098
69.171.212.245:10099
69.171.212.245:10100
69.171.212.245:10101
69.171.212.245:10102
69.171.212.245:10103
69.171.212.245:10104
69.171.212.245:10105
69.171.212.245:10106
69.171.212.245:10107
69.171.212.245:10108
69.171.212.245:10109
69.171.212.245:10110
69.171.212.245:10111
69.171.212.245:10112
69.171.212.245:10113
69.171.212.245:10114
69.171.212.245:10115
69.171.212.245:10116
69.171.212.245:10117
69.171.212.245:10118
69.171.212.245:10119
69.171.212.245:10120
69.171.212.245:10121
69.171.212.245:10122
69.171.212.245:10123
69.171.212.245:10124
69.171.212.245:10125
69.171.212.245:10126
69.171.212.245:10127
69.171.212.245:10128
69.171.212.245:10129
69.171.212.245:10130
69.171.212.245:10131
69.171.212.245:10132
69.171.212.245:10133
69.171.212.245:10134
69.171.212.245:10135
69.171.212.245:10136
69.171.212.245:10137
69.171.212.245:10138
69.171.212.245:10139
69.171.212.245:10140
69.171.212.245:10141
69.171.212.245:10142
69.171.212.245:10143
69.171.212.245:10144
69.171.212.245:10145
69.171.212.245:10146
69.171.212.245:10147
69.171.212.245:10148
69.171.212.245:10149
69.171.212.245:10150
69.171.212.245:10151
69.171.212.245:10152
69.171.212.245:10153
69.171.212.245:10154
69.171.212.245:10155
69.171.212.245:10156
69.171.212.245:10157
69.171.212.245:10158
69.171.212.245:10159
69.171.212.245:10160
69.171.212.245:10161
69.171.212.245:10162
69.171.212.245:10163
69.171.212.245:10164
69.171.212.245:10165
69.171.212.245:10166
69.171.212.245:10167
69.171.212.245:10168
69.171.212.245:10169
69.171.212.245:10170
69.171.212.245:10171
69.171.212.245:10172
69.171.212.245:10173
69.171.212.245:10174
69.171.212.245:10175
69.171.212.245:10176
69.171.212.245:10177
69.171.212.245:10178
69.171.212.245:10179
69.171.212.245:10180
69.171.212.245:10181
69.171.212.245:10182
69.171.212.245:10183
69.171.212.245:10184
69.171.212.245:10185
69.171.212.245:10186
69.171.212.245:10187
69.171.212.245:10188
69.171.212.245:10189
69.171.212.245:10190
69.171.212.245:10191
69.171.212.245:10192
69.171.212.245:10193
69.171.212.245:10194
69.171.212.245:10195
69.171.212.245:10196
69.171.212.245:10197
69.171.212.245:10198
69.171.212.245:10199
69.171.212.245:10200
69.171.212.245:10201
69.171.212.245:10202
69.171.212.245:10203
69.171.212.245:10204
69.171.212.245:10205
69.171.212.245:10206
69.171.212.245:10207
69.171.212.245:10208
69.171.212.245:10209
69.171.212.245:10210
69.171.212.245:10211
69.171.212.245:10212
69.171.212.245:10213
69.171.212.245:10214
69.171.212.245:10215
69.171.212.245:10216
69.171.212.245:10217
69.171.212.245:10218
69.171.212.245:10219
69.171.212.245:10220
69.171.212.245:10221
69.171.212.245:10222
69.171.212.245:10223
69.171.212.245:10224
69.171.212.245:10225
69.171.212.245:10226
69.171.212.245:10227
69.171.212.245:10228
69.171.212.245:10229
69.171.212.245:10230
69.171.212.245:10231
69.171.212.245:10232
69.171.212.245:10233
69.171.212.245:10234
69.171.212.245:10235
69.171.212.245:10236
69.171.212.245:10237
69.171.212.245:10238
69.171.212.245:10239
69.171.212.245:10240
69.171.212.245:10241
69.171.212.245:10242
69.171.212.245:10243
69.171.212.245:10244
69.171.212.245:10245
69.171.212.245:10246
69.171.212.245:10247
69.171.212.245:10248
69.171.212.245:10249
69.171.212.245:10250
69.171.212.245:10251
69.171.212.245:10252
69.171.212.245:10253
69.171.212.245:10254
69.171.212.245:10255
69.171.212.245:10256
69.171.212.245:10257
69.171.212.245:10258
69.171.212.245:10259
69.171.212.245:10260
69.171.212.245:10261
69.171.212.245:10262
69.171.212.245:10263
69.171.212.245:10264
69.171.212.245:10265
69.171.212.245:10266
69.171.212.245:10267
69.171.212.245:10268
69.171.212.245:10269
69.171.212.245:10270
69.171.212.245:10271
69.171.212.245:10272
69.171.212.245:10273
69.171.212.245:10274
69.171.212.245:10275
69.171.212.245:10276
69.171.212.245:10277
69.171.212.245:10278
69.171.212.245:10279
69.171.212.245:10280
69.171.212.245:10281
69.171.212.245:10282
69.171.212.245:10283
69.171.212.245:10284
69.171.212.245:10285
69.171.212.245:10286
69.171.212.245:10287
69.171.212.245:10288
69.171.212.245:10289
69.171.212.245:10290
69.171.212.245:10291
69.171.212.245:10292
69.171.212.245:10293
69.171.212.245:10294
69.171.212.245:10295
69.171.212.245:10296
69.171.212.245:10297
69.171.212.245:10298
69.171.212.245:10299
69.171.212.245:10300
69.171.212.245:10301
69.171.212.245:10302
69.171.212.245:10303
69.171.212.245:10304
69.171.212.245:10305
69.171.212.245:10306
69.171.212.245:10307
69.171.212.245:10308
69.171.212.245:10309
69.171.212.245:10310
69.171.212.245:10311
69.171.212.245:10312
69.171.212.245:10313
69.171.212.245:10314
69.171.212.245:10315
69.171.212.245:10316
69.171.212.245:10317
69.171.212.245:10318
69.171.212.245:10319
69.171.212.245:10320
69.171.212.245:10321
69.171.212.245:10322
69.171.212.245:10323
69.171.212.245:10324
69.171.212.245:10325
69.171.212.245:10326
69.171.212.245:10327
69.171.212.245:10328
69.171.212.245:10329
69.171.212.245:10330
69.171.212.245:10331
69.171.212.245:10332
69.171.212.245:10333
69.171.212.245:10334
69.171.212.245:10335
69.171.212.245:10336
69.171.212.245:10337
69.171.212.245:10338
69.171.212.245:10339
69.171.212.245:10340
69.171.212.245:10341
69.171.212.245:10342
69.171.212.245:10343
69.171.212.245:10344
69.171.212.245:10345
69.171.212.245:10346
69.171.212.245:10347
69.171.212.245:10348
69.171.212.245:10349
69.171.212.245:10350
69.171.212.245:10351
69.171.212.245:10352
69.171.212.245:10353
69.171.212.245:10354
69.171.212.245:10355
69.171.212.245:10356
69.171.212.245:10357
69.171.212.245:10358
69.171.212.245:10359
69.171.212.245:10360
69.171.212.245:10361
69.171.212.245:10362
69.171.212.245:10363
69.171.212.245:10364
69.171.212.245:10365
69.171.212.245:10366
69.171.212.245:10367
69.171.212.245:10368
69.171.212.245:10369
69.171.212.245:10370
69.171.212.245:10371
69.171.212.245:10372
69.171.212.245:10373
69.171.212.245:10374
69.171.212.245:10375
69.171.212.245:10376
69.171.212.245:10377
69.171.212.245:10378
69.171.212.245:10379
69.171.212.245:10380
69.171.212.245:10381
69.171.212.245:10382
69.171.212.245:10383
69.171.212.245:10384
69.171.212.245:10385
69.171.212.245:10386
69.171.212.245:10387
69.171.212.245:10388
69.171.212.245:10389
69.171.212.245:10390
69.171.212.245:10391
69.171.212.245:10392
69.171.212.245:10393
69.171.212.245:10394
69.171.212.245:10395
69.171.212.245:10396
69.171.212.245:10397
69.171.212.245:10398
69.171.212.245:10399
69.171.212.245:10400
69.171.212.245:10401
69.171.212.245:10402
69.171.212.245:10403
69.171.212.245:10404
69.171.212.245:10405
69.171.212.245:10406
69.171.212.245:10407
69.171.212.245:10408
69.171.212.245:10409
69.171.212.245:10410
69.171.212.245:10411
69.171.212.245:10412
69.171.212.245:10413
69.171.212.245:10414
69.171.212.245:10415
69.171.212.245:10416
69.171.212.245:10417
69.171.212.245:10418
69.171.212.245:10419
69.171.212.245:10420
69.171.212.245:10421
69.171.212.245:10422
69.171.212.245:10423
69.171.212.245:10424
69.171.212.245:10425
69.171.212.245:10426
69.171.212.245:10427
69.171.212.245:10428
69.171.212.245:10429
69.171.212.245:10430
69.171.212.245:10431
69.171.212.245:10432
69.171.212.245:10433
69.171.212.245:10434
69.171.212.245:10435
69.171.212.245:10436
69.171.212.245:10437
69.171.212.245:10438
69.171.212.245:10439
69.171.212.245:10440
69.171.212.245:10441
69.171.212.245:10442
69.171.212.245:10443
69.171.212.245:10444
69.171.212.245:10445
69.171.212.245:10446
69.171.212.245:10447
69.171.212.245:10448
69.171.212.245:10449
69.171.212.245:10450
69.171.212.245:10451
69.171.212.245:10452
69.171.212.245:10453
69.171.212.245:10454
69.171.212.245:10455
69.171.212.245:10456
69.171.212.245:10457
69.171.212.245:10458
69.171.212.245:10459
69.171.212.245:10460
69.171.212.245:10461
69.171.212.245:10462
69.171.212.245:10463
69.171.212.245:10464
69.171.212.245:10465
69.171.212.245:10466
69.171.212.245:10467
69.171.212.245:10468
69.171.212.245:10469
69.171.212.245:10470
69.171.212.245:10471
69.171.212.245:10472
69.171.212.245:10473
69.171.212.245:10474
69.171.212.245:10475
69.171.212.245:10476
69.171.212.245:10477
69.171.212.245:10478
69.171.212.245:10479
69.171.212.245:10480
69.171.212.245:10481
69.171.212.245:10482
69.171.212.245:10483
69.171.212.245:10484
69.171.212.245:10485
69.171.212.245:10486
69.171.212.245:10487
69.171.212.245:10488
69.171.212.245:10489
69.171.212.245:10490
69.171.212.245:10491
69.171.212.245:10492
69.171.212.245:10493
69.171.212.245:10494
69.171.212.245:10495
69.171.212.245:10496
69.171.212.245:10497
69.171.212.245:10498
69.171.212.245:10499
69.171.212.245:10500
69.171.212.245:10501
69.171.212.245:10502
69.171.212.245:10503
69.171.212.245:10504
69.171.212.245:10505
69.171.212.245:10506
69.171.212.245:10507
69.171.212.245:10508
69.171.212.245:10509
69.171.212.245:10510
69.171.212.245:10511
69.171.212.245:10512
69.171.212.245:10513
69.171.212.245:10514
69.171.212.245:10515
69.171.212.245:10516
69.171.212.245:10517
69.171.212.245:10518
69.171.212.245:10519
69.171.212.245:10520
69.171.212.245:10521
69.171.212.245:10522
69.171.212.245:10523
69.171.212.245:10524
69.171.212.245:10525
69.171.212.245:10526
69.171.212.245:10527
69.171.212.245:10528
69.171.212.245:10529
69.171.212.245:10530
69.171.212.245:10531
69.171.212.245:10532
69.171.212.245:10533
69.171.212.245:10534
69.171.212.245:10535
69.171.212.245:10536
69.171.212.245:10537
69.171.212.245:10538
69.171.212.245:10539
69.171.212.245:10540
69.171.212.245:10541
69.171.212.245:10542
69.171.212.245:10543
69.171.212.245:10544
69.171.212.245:10545
69.171.212.245:10546
69.171.212.245:10547
69.171.212.245:10548
69.171.212.245:10549
69.171.212.245:10550
69.171.212.245:10551
69.171.212.245:10552
69.171.212.245:10553
69.171.212.245:10554
69.171.212.245:10555
69.171.212.245:10556
69.171.212.245:10557
69.171.212.245:10558
69.171.212.245:10559
69.171.212.245:10560
69.171.212.245:10561
69.171.212.245:10562
69.171.212.245:10563
69.171.212.245:10564
69.171.212.245:10565
69.171.212.245:10566
69.171.212.245:10567
69.171.212.245:10568
69.171.212.245:10569
69.171.212.245:10570
69.171.212.245:10571
69.171.212.245:10572
69.171.212.245:10573
69.171.212.245:10574
69.171.212.245:10575
69.171.212.245:10576
69.171.212.245:10577
69.171.212.245:10578
69.171.212.245:10579
69.171.212.245:10580
69.171.212.245:10581
69.171.212.245:10582
69.171.212.245:10583
69.171.212.245:10584
69.171.212.245:10585
69.171.212.245:10586
69.171.212.245:10587
69.171.212.245:10588
69.171.212.245:10589
69.171.212.245:10590
69.171.212.245:10591
69.171.212.245:10592
69.171.212.245:10593
69.171.212.245:10594
69.171.212.245:10595
69.171.212.245:10596
69.171.212.245:10597
69.171.212.245:10598
69.171.212.245:10599
69.171.212.245:10600
69.171.212.245:10601
69.171.212.245:10602
69.171.212.245:10603
69.171.212.245:10604
69.171.212.245:10605
69.171.212.245:10606
69.171.212.245:10607
69.171.212.245:10608
69.171.212.245:10609
69.171.212.245:10610
69.171.212.245:10611
69.171.212.245:10612
69.171.212.245:10613
69.171.212.245:10614
69.171.212.245:10615
69.171.212.245:10616
69.171.212.245:10617
69.171.212.245:10618
69.171.212.245:10619
69.171.212.245:10620
69.171.212.245:10621
69.171.212.245:10622
69.171.212.245:10623
69.171.212.245:10624
69.171.212.245:10625
69.171.212.245:10626
69.171.212.245:10627
69.171.212.245:10628
69.171.212.245:10629
69.171.212.245:10630
69.171.212.245:10631
69.171.212.245:10632
69.171.212.245:10633
69.171.212.245:10634
69.171.212.245:10635
69.171.212.245:10636
69.171.212.245:10637
69.171.212.245:10638
69.171.212.245:10639
69.171.212.245:10640
69.171.212.245:10641
69.171.212.245:10642
69.171.212.245:10643
69.171.212.245:10644
69.171.212.245:10645
69.171.212.245:10646
69.171.212.245:10647
69.171.212.245:10648
69.171.212.245:10649
69.171.212.245:10650
69.171.212.245:10651
69.171.212.245:10652
69.171.212.245:10653
69.171.212.245:10654
69.171.212.245:10655
69.171.212.245:10656
69.171.212.245:10657
69.171.212.245:10658
69.171.212.245:10659
69.171.212.245:10660
69.171.212.245:10661
69.171.212.245:10662
69.171.212.245:10663
69.171.212.245:10664
69.171.212.245:10665
69.171.212.245:10666
69.171.212.245:10667
69.171.212.245:10668
69.171.212.245:10669
69.171.212.245:10670
69.171.212.245:10671
69.171.212.245:10672
69.171.212.245:10673
69.171.212.245:10674
69.171.212.245:10675
69.171.212.245:10676
69.171.212.245:10677
69.171.212.245:10678
69.171.212.245:10679
69.171.212.245:10680
69.171.212.245:10681
69.171.212.245:10682
69.171.212.245:10683
69.171.212.245:10684
69.171.212.245:10685
69.171.212.245:10686
69.171.212.245:10687
69.171.212.245:10688
69.171.212.245:10689
69.171.212.245:10690
69.171.212.245:10691
69.171.212.245:10692
69.171.212.245:10693
69.171.212.245:10694
69.171.212.245:10695
69.171.212.245:10696
69.171.212.245:10697
69.171.212.245:10698
69.171.212.245:10699
69.171.212.245:10700
69.171.212.245:10701
69.171.212.245:10702
69.171.212.245:10703
69.171.212.245:10704
69.171.212.245:10705
69.171.212.245:10706
69.171.212.245:10707
69.171.212.245:10708
69.171.212.245:10709
69.171.212.245:10710
69.171.212.245:10711
69.171.212.245:10712
69.171.212.245:10713
69.171.212.245:10714
69.171.212.245:10715
69.171.212.245:10716
69.171.212.245:10717
69.171.212.245:10718
69.171.212.245:10719
69.171.212.245:10720
69.171.212.245:10721
69.171.212.245:10722
69.171.212.245:10723
69.171.212.245:10724
69.171.212.245:10725
69.171.212.245:10726
69.171.212.245:10727
69.171.212.245:10728
69.171.212.245:10729
69.171.212.245:10730
69.171.212.245:10731
69.171.212.245:10732
69.171.212.245:10733
69.171.212.245:10734
69.171.212.245:10735
69.171.212.245:10736
69.171.212.245:10737
69.171.212.245:10738
69.171.212.245:10739
69.171.212.245:10740
69.171.212.245:10741
69.171.212.245:10742
69.171.212.245:10743
69.171.212.245:10744
69.171.212.245:10745
69.171.212.245:10746
69.171.212.245:10747
69.171.212.245:10748
69.171.212.245:10749
69.171.212.245:10750
69.171.212.245:10751
69.171.212.245:10752
69.171.212.245:10753
69.171.212.245:10754
69.171.212.245:10755
69.171.212.245:10756
69.171.212.245:10757
69.171.212.245:10758
69.171.212.245:10759
69.171.212.245:10760
69.171.212.245:10761
69.171.212.245:10762
69.171.212.245:10763
69.171.212.245:10764
69.171.212.245:10765
69.171.212.245:10766
69.171.212.245:10767
69.171.212.245:10768
69.171.212.245:10769
69.171.212.245:10770
69.171.212.245:10771
69.171.212.245:10772
69.171.212.245:10773
69.171.212.245:10774
69.171.212.245:10775
69.171.212.245:10776
69.171.212.245:10777
69.171.212.245:10778
69.171.212.245:10779
69.171.212.245:10780
69.171.212.245:10781
69.171.212.245:10782
69.171.212.245:10783
69.171.212.245:10784
69.171.212.245:10785
69.171.212.245:10786
69.171.212.245:10787
69.171.212.245:10788
69.171.212.245:10789
69.171.212.245:10790
69.171.212.245:10791
69.171.212.245:10792
69.171.212.245:10793
69.171.212.245:10794
69.171.212.245:10795
69.171.212.245:10796
69.171.212.245:10797
69.171.212.245:10798
69.171.212.245:10799
69.171.212.245:10800
69.171.212.245:10801
69.171.212.245:10802
69.171.212.245:10803
69.171.212.245:10804
69.171.212.245:10805
69.171.212.245:10806
69.171.212.245:10807
69.171.212.245:10808
69.171.212.245:10809
69.171.212.245:10810
69.171.212.245:10811
69.171.212.245:10812
69.171.212.245:10813
69.171.212.245:10814
69.171.212.245:10815
69.171.212.245:10816
69.171.212.245:10817
69.171.212.245:10818
69.171.212.245:10819
69.171.212.245:10820
69.171.212.245:10821
69.171.212.245:10822
69.171.212.245:10823
69.171.212.245:10824
69.171.212.245:10825
69.171.212.245:10826
69.171.212.245:10827
69.171.212.245:10828
69.171.212.245:10829
69.171.212.245:10830
69.171.212.245:10831
69.171.212.245:10832
69.171.212.245:10833
69.171.212.245:10834
69.171.212.245:10835
69.171.212.245:10836
69.171.212.245:10837
69.171.212.245:10838
69.171.212.245:10839
69.171.212.245:10840
69.171.212.245:10841
69.171.212.245:10842
69.171.212.245:10843
69.171.212.245:10844
69.171.212.245:10845
69.171.212.245:10846
69.171.212.245:10847
69.171.212.245:10848
69.171.212.245:10849
69.171.212.245:10850
69.171.212.245:10851
69.171.212.245:10852
69.171.212.245:10853
69.171.212.245:10854
69.171.212.245:10855
69.171.212.245:10856
69.171.212.245:10857
69.171.212.245:10858
69.171.212.245:10859
69.171.212.245:10860
69.171.212.245:10861
69.171.212.245:10862
69.171.212.245:10863
69.171.212.245:10864
69.171.212.245:10865
69.171.212.245:10866
69.171.212.245:10867
69.171.212.245:10868
69.171.212.245:10869
69.171.212.245:10870
69.171.212.245:10871
69.171.212.245:10872
69.171.212.245:10873
69.171.212.245:10874
69.171.212.245:10875
69.171.212.245:10876
69.171.212.245:10877
69.171.212.245:10878
69.171.212.245:10879
69.171.212.245:10880
69.171.212.245:10881
69.171.212.245:10882
69.171.212.245:10883
69.171.212.245:10884
69.171.212.245:10885
69.171.212.245:10886
69.171.212.245:10887
69.171.212.245:10888
69.171.212.245:10889
69.171.212.245:10890
69.171.212.245:10891
69.171.212.245:10892
69.171.212.245:10893
69.171.212.245:10894
69.171.212.245:10895
69.171.212.245:10896
69.171.212.245:10897
69.171.212.245:10898
69.171.212.245:10899
69.171.212.245:10900
69.171.212.245:10901
69.171.212.245:10902
69.171.212.245:10903
69.171.212.245:10904
69.171.212.245:10905
69.171.212.245:10906
69.171.212.245:10907
69.171.212.245:10908
69.171.212.245:10909
69.171.212.245:10910
69.171.212.245:10911
69.171.212.245:10912
69.171.212.245:10913
69.171.212.245:10914
69.171.212.245:10915
69.171.212.245:10916
69.171.212.245:10917
69.171.212.245:10918
69.171.212.245:10919
69.171.212.245:10920
69.171.212.245:10921
69.171.212.245:10922
69.171.212.245:10923
69.171.212.245:10924
69.171.212.245:10925
69.171.212.245:10926
69.171.212.245:10927
69.171.212.245:10928
69.171.212.245:10929
69.171.212.245:10930
69.171.212.245:10931
69.171.212.245:10932
69.171.212.245:10933
69.171.212.245:10934
69.171.212.245:10935
69.171.212.245:10936
69.171.212.245:10937
69.171.212.245:10938
69.171.212.245:10939
69.171.212.245:10940
69.171.212.245:10941
69.171.212.245:10942
69.171.212.245:10943
69.171.212.245:10944
69.171.212.245:10945
69.171.212.245:10946
69.171.212.245:10947
69.171.212.245:10948
69.171.212.245:10949
69.171.212.245:10950
69.171.212.245:10951
69.171.212.245:10952
69.171.212.245:10953
69.171.212.245:10954
69.171.212.245:10955
69.171.212.245:10956
69.171.212.245:10957
69.171.212.245:10958
69.171.212.245:10959
69.171.212.245:10960
69.171.212.245:10961
69.171.212.245:10962
69.171.212.245:10963
69.171.212.245:10964
69.171.212.245:10965
69.171.212.245:10966
69.171.212.245:10967
69.171.212.245:10968
69.171.212.245:10969
69.171.212.245:10970
69.171.212.245:10971
69.171.212.245:10972
69.171.212.245:10973
69.171.212.245:10974
69.171.212.245:10975
69.171.212.245:10976
69.171.212.245:10977
69.171.212.245:10978
69.171.212.245:10979
69.171.212.245:10980
69.171.212.245:10981
69.171.212.245:10982
69.171.212.245:10983
69.171.212.245:10984
69.171.212.245:10985
69.171.212.245:10986
69.171.212.245:10987
69.171.212.245:10988
69.171.212.245:10989
69.171.212.245:10990
69.171.212.245:10991
69.171.212.245:10992
69.171.212.245:10993
69.171.212.245:10994
69.171.212.245:10995
69.171.212.245:10996
69.171.212.245:10997
69.171.212.245:10998
69.171.212.245:10999
69.171.212.245:11000
69.171.212.245:11001
69.171.212.245:11002
69.171.212.245:11003
69.171.212.245:11004`.split("\n")
let workingProxies = [];
let a = 0;

// Client credentials

const SITE = 'footpatrolgb',
URL = 'https://www.footpatrol.com',
credentials = {
    id: '253ae55594',
    key: '33367a7dc65731b695e0882f12d5f707',
    algorithm: 'sha256'
},
API_KEY = '52F096E285134DF2A9E1AFAF979BB415';

async function test() {
    let proxy = helper.getRandomMeshProxy()
    if(!proxy) {
        fs.writeFileSync("meshproxies2.json", JSON.stringify(workingProxies));
        console.log(workingProxies.length + "/" + PROXIES.length)
        return;
    }
    let sku = ['413155_footpatrolcom', '409144_footpatrolcom', '475613_footpatrolcom', '398537_footpatrolcom', '413657_footpatrolcom', '399552_footpatrolcom'];
    sku = sku[helper.getRandomNumber(0, sku.length)]
    const requestOptions = {
        uri: `https://prod.jdgroupmesh.cloud/stores/${SITE}/products/399552_footpatrolcom?channel=iphone-app&expand=variations`,
        method: 'GET',
        headers: {},
        // agent: new HTTPSProxyAgent(proxy),
signal: controller.signal
    };

    // Generate Authorization request header

    const { header } = Hawk.client.header(requestOptions.uri, 'GET', { credentials: credentials, ext: 'some-app-data' });
    // console.log(header)
    requestOptions.headers["X-Request-Auth"] = header;
    requestOptions.headers["x-api-key"] = API_KEY

    // Send authenticated request

    // Request(requestOptions, function (error, response, body) {

    //     // Authenticate the server's response

    //     // const isValid = Hawk.client.authenticate(response, credentials, header.artifacts, { payload: body });

    //     // Output results

    //     console.log(`${response.statusCode}: ${body}`);
    // });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    fetch(requestOptions.uri, requestOptions).then(async response => {
        console.log(response.status + " - " + proxy);
        console.log(await response.text())
        if(response.status === 200) {
            workingProxies.push(proxy);
            console.log(proxy)
        }
        // test();
        // let body = await response.json();
        // console.log(body)
        // for(let product of body.products) {
        //     console.log(product.SKU + " - " + product.name)
        //     console.log(product.price)
        // }
        // // console.log(body.name);
        // // console.log(body.stockStatus)
        // // console.log(body.price.currency + " " + body.price.amount)
        // // console.log(body.mainImage);
        // // for (let size in body.options) {
        // //     if (body.options[size].stockStatus === 'IN STOCK')
        // //         console.log(size);
        // // }
    })
}

test()
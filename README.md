---
title: Botan
template: views/base.pug
---

Botan
=====

(づ｡◕‿‿◕｡)づ

Bot imut dan lucu. Berisi fitur-fitur untuk melengkapi kebutuhan kanal irc.

Layangkan bug atau permintaan fitur ke nick **presiden** di kanal
[`#ubuntu-indonesia`](https://kiwiirc.com/client/chat.freenode.net/#ubuntu-indonesia) (`freenode`). Kode botan ada di <https://gomix.com/#!/project/botan>

Perintah dan Fitur
==================

### .bantuan

```
.bantuan
```

Link ke halaman ini. Alias: `.help`


### .ingat

Mengingat fakta atau kata kunci, contohnya:

```
.ingat log = http://test.com
```

format fakta untuk diingat:

```
nama-fakta = isi dari fakta yang ingin diingat
```

`nama-fakta` hanya boleh berisi karakter alphanumeric (`a-z, A-Z, 0-9`) atau underscore (`_`) dan dash (`-`).


Untuk memanggil fakta/kata kunci, gunakan salah satu format berikut ini:

```
!nama-fakta
!nama-fakta @ nick
```

Gunakan format kedua jika kalian ingin botan menyampaikan fakta tersebut kepada `nick`.


### .lupakan

Melupakan fakta atau kata kunci, contohnya:

```
.lupakan log
```

Fakta atau kata kunci akan dihapus dari *database*. Pemanggilan berikutnya fakta tersebut tidak
akan menghasilkan balasan.

### .kelihatan

Mencari tahu kapan seseorang terakhir terlihat di kanal. Contohnya:

```
.kelihatan ChanServ
```

Si botan akan menjawab dengan informasi waktu kapan terakhir nick tersebut terlihat di kanal.


### .bintang

Memberikan bintang ke seseorang. Contohnya:

```
.bintang ChanServ
```

Nick yang diberi bintang harus online di kanal yang sama. Bintang yang dikumpulkan bisa dilihat di
website ini.

Bila terkumpul cukup bintang, bisa ditukarkan untuk mendapatkan warna nick di log channel.

### .ping

Biasanya untuk menguji apakah kita (atau si botan) masih tersambung ke IRC.

```
.ping
```

Perintah ini akan membuat si botan membalas dengan `pong`.

### Substitute (s/regex/replacement/opt)

Membetulkan perkataan terakhir yang kita ucapkan. Contohnya:

```
Joko: Hai semu!
Joko: s/semu/semua/
```

Botan akan membalas dengan mengutip pembetulan dari perkataan kita. Untuk contoh diatas, botan akan
membalas: `Joko bermaksud mengatakan "Hai semua!"`.
Formatnya mirip dengan perintah subtitute di `sed`.

```
s/regex/replacement/options
```

Pattern yang digunakan adalah pattern regex di javascript.


### Judul Video Youtube

Jika ada yang posting link ke youtube, botan otomatis akan memberitahukan judul dari video tersebut.

Dependensi
==========


- [express](https://www.npmjs.com/package/express) (MIT)
- [request](https://www.npmjs.com/package/request) (Apache-2.0)
- [irc-message](https://www.npmjs.com/package/irc-message) (BSD-2-Clause)
- [irc-socket](https://www.npmjs.com/package/irc-socket) (ISC)
- [js-base64](https://www.npmjs.com/package/js-base64) ([BSD-2-Clause](https://github.com/dankogai/js-base64/blob/master/LICENSE.md))
- [express-remarkable](https://www.npmjs.com/package/express-remarkable) (MIT)
- [express-pug](https://www.npmjs.com/package/pug) (MIT)
- [awsm.css](https://igoradamenko.github.io/awsm.css/) ([MIT](https://github.com/igoradamenko/awsm.css/blob/master/LICENSE.md))
- [lokijs](https://www.npmjs.com/package/lokijs) (MIT)
- [hbs](https://www.npmjs.com/package/hbs) (MIT)
- [bluebird](https://www.npmjs.com/package/bluebird) (MIT)
- [moment](https://www.npmjs.com/package/moment) (MIT)


Lisensi
=======

MIT License

Copyright (c) 2017 Adit Cahya Ramadhan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

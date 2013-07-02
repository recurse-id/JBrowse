//>>built
require({cache: {"JBrowse/Store/TabixIndexedFile": function () {
    define("JBrowse/Store/TabixIndexedFile", "dojo/_base/declare,dojo/_base/array,JBrowse/Util,JBrowse/Store/LRUCache,JBrowse/Errors,JBrowse/Model/XHRBlob,JBrowse/Model/BGZip/BGZBlob,JBrowse/Model/TabixIndex".split(","), function (k, h, i, d, l, b, c, f) {
        return k(null, {constructor: function (a) {
            this.browser = a.browser;
            this.index = new f({blob: new c(a.tbi), browser: a.browser});
            this.data = new c(a.file);
            this.indexLoaded = this.index.load();
            this.chunkSizeLimit = a.chunkSizeLimit ||
                15E6
        }, getLines: function (a, e, c, f, b, g) {
            var q = this, d = Array.prototype.slice.call(arguments);
            this.indexLoaded.then(function () {
                q._fetch.apply(q, d)
            }, g)
        }, _fetch: function (a, e, c, f, b, g) {
            var g = g || function (a) {
                console.error(a, a.stack)
            }, d = this.index.blocksForRange(a, e, c);
            if (d) {
                d.toString = d.toUniqueString = function () {
                    return this.join(", ")
                };
                for (var m = 0; m < d.length; m++) {
                    var h = d[m].fetchedSize();
                    if (h > this.chunkSizeLimit) {
                        g(new l.DataOverflow("Too much data. Chunk size " + i.commifyNumber(h) + " bytes exceeds chunkSizeLimit of " +
                            i.commifyNumber(this.chunkSizeLimit) + "."));
                        return
                    }
                }
                try {
                    this._fetchChunkData(d, a, e, c, f, b, g)
                } catch (k) {
                    g(k)
                }
            } else g("Error in index fetch (" + [a, e, c].join() + ")")
        }, _fetchChunkData: function (a, e, c, f, b, g, l) {
            if (a.length) {
                var m = 0, i = this.chunkCache = this.chunkCache || new d({name: "TabixIndexedFileChunkedCache", fillCallback: dojo.hitch(this, "_readChunkItems"), sizeFunction: function (a) {
                    return a.length
                }, maxSize: 1E5}), k = this.browser.regularizeReferenceName(e), p;
                h.forEach(a, function (e) {
                    i.get(e, function (e, d) {
                        d && !p && l(d);
                        if (!(p = p || d)) {
                            for (var h = 0; h < e.length; h++) {
                                var i = e[h];
                                if (i._regularizedRef == k)if (i.start > f)break; else i.end >= c && b(i)
                            }
                            ++m == a.length && g()
                        }
                    })
                })
            } else g()
        }, _readChunkItems: function (a, e) {
            var c = this, f = [];
            c.data.read(a.minv.block, a.maxv.block - a.minv.block + 1, function (b) {
                var b = new Uint8Array(b), g = a.minv.block ? h.indexOf(b, c._newlineCode, 0) + 1 : 0;
                try {
                    c.parseItems(b, g, function (a) {
                        f.push(a)
                    }, function () {
                        e(f)
                    })
                } catch (d) {
                    e(null, d)
                }
            }, function (a) {
                e(null, a)
            })
        }, parseItems: function (a, e, c, f) {
            for (var b = this, g = 0, d = {data: a, offset: e}; ;)if (300 >=
                g)if (e = this.parseItem(d))c(e), g++; else {
                f();
                break
            } else {
                window.setTimeout(function () {
                    b.parseItems(a, d.offset, c, f)
                }, 1);
                break
            }
        }, parseItem: function (a) {
            var e = this.index.metaChar, c;
            do c = this._getline(a); while (c && c[0] == e);
            if (!c)return null;
            a = c.split("\t");
            return{ref: a[this.index.columnNumbers.ref - 1], _regularizedRef: this.browser.regularizeReferenceName(a[this.index.columnNumbers.ref - 1]), start: parseInt(a[this.index.columnNumbers.start - 1]), end: parseInt(a[this.index.columnNumbers.end - 1]), fields: a}
        }, _newlineCode: 10,
            _getline: function (a) {
                var e = a.data, c = h.indexOf(e, this._newlineCode, a.offset);
                if (-1 == c)return null;
                for (var f = "", b = a.offset; b < c; b++)f += String.fromCharCode(e[b]);
                a.offset = c + 1;
                return f
            }})
    })
}, "JBrowse/Model/BGZip/BGZBlob": function () {
    define(["dojo/_base/declare", "jszlib/inflate", "jszlib/arrayCopy"], function (k, h, i) {
        var d = k(null, {constructor: function (d) {
            this.blob = d
        }, blockSize: 65536, slice: function (l, b) {
            return new d(this.blob.slice(l, b))
        }, fetch: function (d, b) {
            this.blob.fetch(this._wrap(d), b)
        }, read: function (d, b, c, f) {
            this.blob.read(d, b + this.blockSize, this._wrap(c, b), f)
        }, _wrap: function (d, b) {
            var c = this;
            return function (f) {
                d(c.unbgzf(f, b))
            }
        }, readInt: function (d, b) {
            return d[b + 3] << 24 | d[b + 2] << 16 | d[b + 1] << 8 | d[b]
        }, readShort: function (d, b) {
            return d[b + 1] << 8 | d[b]
        }, readFloat: function (d, b) {
            for (var c = new Uint8Array(4), f = 0; 4 > f; f++)c[f] = d[b + f];
            return(new Float32Array(c.buffer))[0]
        }, unbgzf: function (d, b) {
            for (var b = Math.min(b || Infinity, d.byteLength - 27), c = [], f = 0, a = [0]; a[0] < b; a[0] += 8) {
                var e = new Uint8Array(d, a[0], 18);
                if (!(31 == e[0] &&
                    139 == e[1])) {
                    console.error("invalid BGZF block header, skipping", e);
                    break
                }
                var e = this.readShort(e, 10), e = a[0] + 12 + e, n;
                try {
                    n = h(d, e, d.byteLength - e, a)
                } catch (j) {
                    if (/^Z_BUF_ERROR/.test(j.statusString) && c.length)break; else throw j;
                }
                n.byteLength && (f += n.byteLength, c.push(n))
            }
            if (1 == c.length)return c[0];
            f = new Uint8Array(f);
            for (n = a = 0; n < c.length; ++n)e = new Uint8Array(c[n]), i(e, 0, f, a, e.length), a += e.length;
            return f.buffer
        }});
        return d
    })
}, "JBrowse/Model/TabixIndex": function () {
    define("dojo/_base/declare,dojo/_base/array,dojo/_base/Deferred,JBrowse/has,jDataView,JBrowse/Util,JBrowse/Model/BGZip/VirtualOffset".split(","),
        function (k, h, i, d, l, b, c) {
            var f = b.fastDeclare({constructor: function (a, c, f) {
                this.minv = a;
                this.maxv = c;
                this.bin = f
            }, toUniqueString: function () {
                return this.minv + ".." + this.maxv + " (bin " + this.bin + ")"
            }, toString: function () {
                return this.toUniqueString()
            }, compareTo: function (a) {
                return this.minv - a.minv || this.maxv - a.maxv || this.bin - a.bin
            }, compare: function (a) {
                return this.compareTo(a)
            }, fetchedSize: function () {
                return this.maxv.block + 65536 - this.minv.block + 1
            }});
            return k(null, {constructor: function (a) {
                this.browser = a.browser;
                this.blob = a.blob;
                this.load()
            }, load: function () {
                var a = this;
                return this._loaded = this._loaded || function () {
                    var c = new i;
                    d("typed-arrays") ? this.blob.fetch(function (f) {
                        a._parseIndex(f, c)
                    }, dojo.hitch(c, "reject")) : c.reject("This web browser lacks support for JavaScript typed arrays.");
                    return c
                }.call(this)
            }, _parseIndex: function (a, e) {
                this._littleEndian = !0;
                var b = new l(a, 0, void 0, this._littleEndian);
                if (21578324 != b.getInt32() && (this._littleEndian = !1, b = new l(a, 0, void 0, this._littleEndian), 21578324 != b.getInt32())) {
                    console.error("Not a TBI file");
                    e.reject("Not a TBI file");
                    return
                }
                var j = b.getInt32();
                this.presetType = b.getInt32();
                this.columnNumbers = {ref: b.getInt32(), start: b.getInt32(), end: b.getInt32()};
                this.metaChar = (this.metaValue = b.getInt32()) ? String.fromCharCode(this.metaValue) : null;
                this.skipLines = b.getInt32();
                this._refIDToName = Array(j);
                this._refNameToID = {};
                var d = b.getInt32();
                this._parseNameBytes(b.getBytes(d, void 0, !1));
                this._indices = Array(j);
                for (d = 0; d < j; ++d) {
                    for (var g = b.getInt32(), h = this._indices[d] = {binIndex: {}}, m = 0; m < g; ++m) {
                        for (var i =
                            b.getInt32(), k = b.getInt32(), p = Array(k), o = 0; o < k; ++o) {
                            var r = new c(b.getBytes(8)), s = new c(b.getBytes(8));
                            this._findFirstData(r);
                            p[o] = new f(r, s, i)
                        }
                        h.binIndex[i] = p
                    }
                    g = b.getInt32();
                    h = h.linearIndex = Array(g);
                    for (o = 0; o < g; ++o)h[o] = new c(b.getBytes(8)), this._findFirstData(h[o])
                }
                e.resolve({success: !0})
            }, _findFirstData: function (a) {
                var c = this.firstDataLine;
                this.firstDataLine = c ? 0 < c.compareTo(a) ? a : c : a
            }, _parseNameBytes: function (a) {
                function c() {
                    var e = a[f++];
                    return e ? String.fromCharCode(e) : null
                }

                function b() {
                    for (var a,
                             f = ""; a = c();)f += a;
                    return f.length ? f : null
                }

                for (var f = 0, d, g = 0; d = b(); g++)this._refIDToName[g] = d, this._refNameToID[this.browser.regularizeReferenceName(d)] = g
            }, hasRefSeq: function (a, c) {
                var f = this, a = f.browser.regularizeReferenceName(a);
                f.load().then(function () {
                    a in f._refNameToID ? c(!0) : c(!1)
                })
            }, getRefId: function (a) {
                a = this.browser.regularizeReferenceName(a);
                return this._refNameToID[a]
            }, TAD_LIDX_SHIFT: 14, blocksForRange: function (a, e, b) {
                0 > e && (e = 0);
                a = this._indices[this.getRefId(a)];
                if (!a)return[];
                for (var d = a.linearIndex,
                         a = a.binIndex, b = this._reg2bins(e, b), h = d.length ? d[e >> this.TAD_LIDX_SHIFT >= d.length ? d.length - 1 : e >> this.TAD_LIDX_SHIFT] : new c(0, 0), e = d = 0; e < b.length; ++e)d += (a[b[e]] || []).length;
                if (0 == d)return[];
                for (var g = [], i, e = d = 0; e < b.length; ++e)if (i = a[b[e]])for (var m = 0; m < i.length; ++m)0 > h.compareTo(i[m].maxv) && (g[d++] = new f(i[m].minv, i[m].maxv, i[m].bin));
                if (!g.length)return[];
                g = g.sort(function (a, c) {
                    return a.compareTo(c)
                });
                for (e = 1, a = 0; e < d; ++e)if (0 > g[a].maxv.compareTo(g[e].maxv))++a, g[a].minv = g[e].minv, g[a].maxv = g[e].maxv;
                d = a + 1;
                for (e = 1; e < d; ++e)if (g[e - 1].maxv >= g[e].minv)g[e - 1].maxv = g[e].minv;
                for (e = 1, a = 0; e < d; ++e) {
                    if (g[a].maxv.block != g[e].minv.block)++a, g[a].minv = g[e].minv;
                    g[a].maxv = g[e].maxv
                }
                return g.slice(0, a + 1)
            }, _reg2bin: function (a, c) {
                --c;
                return a >> 14 == c >> 14 ? 4681 + (a >> 14) : a >> 17 == c >> 17 ? 585 + (a >> 17) : a >> 20 == c >> 20 ? 73 + (a >> 20) : a >> 23 == c >> 23 ? 9 + (a >> 23) : a >> 26 == c >> 26 ? 1 + (a >> 26) : 0
            }, _reg2bins: function (a, c) {
                var b, f = [];
                --c;
                f.push(0);
                for (b = 1 + (a >> 26); b <= 1 + (c >> 26); ++b)f.push(b);
                for (b = 9 + (a >> 23); b <= 9 + (c >> 23); ++b)f.push(b);
                for (b = 73 + (a >> 20); b <=
                    73 + (c >> 20); ++b)f.push(b);
                for (b = 585 + (a >> 17); b <= 585 + (c >> 17); ++b)f.push(b);
                for (b = 4681 + (a >> 14); b <= 4681 + (c >> 14); ++b)f.push(b);
                return f
            }})
        })
}, "jDataView/jdataview": function () {
    define([], function () {
        var k = {};
        (function (h) {
            var i = {ArrayBuffer: "undefined" !== typeof ArrayBuffer, DataView: "undefined" !== typeof DataView && ("getFloat64"in DataView.prototype || "getFloat64"in new DataView(new ArrayBuffer(1))), NodeBuffer: "undefined" !== typeof Buffer && "readInt16LE"in Buffer.prototype}, d = {Int8: 1, Int16: 2, Int32: 4, Uint8: 1, Uint16: 2,
                Uint32: 4, Float32: 4, Float64: 8}, l = {Int8: "Int8", Int16: "Int16", Int32: "Int32", Uint8: "UInt8", Uint16: "UInt16", Uint32: "UInt32", Float32: "Float", Float64: "Double"}, b = function (c, f, a, e) {
                if (!(this instanceof b))throw Error("jDataView constructor may not be called as a function");
                this.buffer = c;
                if (!(i.NodeBuffer && c instanceof Buffer) && !(i.ArrayBuffer && c instanceof ArrayBuffer) && "string" !== typeof c)throw new TypeError("jDataView buffer has an incompatible type");
                this._isArrayBuffer = i.ArrayBuffer && c instanceof ArrayBuffer;
                this._isDataView = i.DataView && this._isArrayBuffer;
                this._isNodeBuffer = i.NodeBuffer && c instanceof Buffer;
                this._littleEndian = Boolean(e);
                var n = this._isArrayBuffer ? c.byteLength : c.length;
                void 0 === f && (f = 0);
                this.byteOffset = f;
                void 0 === a && (a = n - f);
                this.byteLength = a;
                if (!this._isDataView) {
                    if ("number" !== typeof f)throw new TypeError("jDataView byteOffset is not a number");
                    if ("number" !== typeof a)throw new TypeError("jDataView byteLength is not a number");
                    if (0 > f)throw Error("jDataView byteOffset is negative");
                    if (0 >
                        a)throw Error("jDataView byteLength is negative");
                }
                if (this._isDataView)this._view = new DataView(c, f, a), this._start = 0;
                this._start = f;
                if (f + a > n)throw Error("jDataView (byteOffset + byteLength) value is out of bounds");
                this._offset = 0;
                if (this._isDataView)for (var j in d)d.hasOwnProperty(j) && function (a, c) {
                    var b = d[a];
                    c["get" + a] = function (f, e) {
                        if (void 0 === e)e = c._littleEndian;
                        if (void 0 === f)f = c._offset;
                        c._offset = f + b;
                        return c._view["get" + a](f, e)
                    }
                }(j, this); else if (this._isNodeBuffer && i.NodeBuffer)for (j in d)d.hasOwnProperty(j) &&
                function (a, c, b) {
                    var f = d[a];
                    c["get" + a] = function (a) {
                        if (void 0 === a)a = c._offset;
                        c._offset = a + f;
                        return c.buffer[b](c._start + a)
                    }
                }(j, this, "Int8" === j || "Uint8" === j ? "read" + l[j] : e ? "read" + l[j] + "LE" : "read" + l[j] + "BE"); else for (j in d)d.hasOwnProperty(j) && function (a, c) {
                    var b = d[a];
                    c["get" + a] = function (f, e) {
                        if (void 0 === e)e = c._littleEndian;
                        if (void 0 === f)f = c._offset;
                        c._offset = f + b;
                        if (c._isArrayBuffer && 0 === (c._start + f) % b && (1 === b || e))return(new h[a + "Array"](c.buffer, c._start + f, 1))[0];
                        if ("number" !== typeof f)throw new TypeError("jDataView byteOffset is not a number");
                        if (f + b > c.byteLength)throw Error("jDataView (byteOffset + size) value is out of bounds");
                        return c["_get" + a](c._start + f, e)
                    }
                }(j, this)
            };
            b.createBuffer = i.NodeBuffer ? function () {
                return new Buffer(arguments)
            } : i.ArrayBuffer ? function () {
                return(new Uint8Array(arguments)).buffer
            } : function () {
                return String.fromCharCode.apply(null, arguments)
            };
            b.prototype = {compatibility: i, _getBytes: function (c, b, a) {
                var e;
                if (void 0 === a)a = this._littleEndian;
                if (void 0 === b)b = this._offset;
                if ("number" !== typeof b)throw new TypeError("jDataView byteOffset is not a number");
                if (0 > c || b + c > this.byteLength)throw Error("jDataView length or (byteOffset+length) value is out of bounds");
                b += this._start;
                this._isArrayBuffer ? e = new Uint8Array(this.buffer, b, c) : (e = this.buffer.slice(b, b + c), this._isNodeBuffer || (e = Array.prototype.map.call(e, function (a) {
                    return a.charCodeAt(0) & 255
                })));
                a && 1 < c && (e instanceof Array || (e = Array.prototype.slice.call(e)), e.reverse());
                this._offset = b - this._start + c;
                return e
            }, getBytes: function (c, b, a) {
                var e = this._getBytes.apply(this, arguments);
                e instanceof Array || (e =
                    Array.prototype.slice.call(e));
                return e
            }, getString: function (c, b) {
                var a;
                if (this._isNodeBuffer) {
                    if (void 0 === b)b = this._offset;
                    if ("number" !== typeof b)throw new TypeError("jDataView byteOffset is not a number");
                    if (0 > c || b + c > this.byteLength)throw Error("jDataView length or (byteOffset+length) value is out of bounds");
                    a = this.buffer.toString("ascii", this._start + b, this._start + b + c);
                    this._offset = b + c
                } else a = String.fromCharCode.apply(null, this._getBytes(c, b, !1));
                return a
            }, getChar: function (c) {
                return this.getString(1,
                    c)
            }, tell: function () {
                return this._offset
            }, seek: function (c) {
                if ("number" !== typeof c)throw new TypeError("jDataView byteOffset is not a number");
                if (0 > c || c > this.byteLength)throw Error("jDataView byteOffset value is out of bounds");
                return this._offset = c
            }, _getFloat64: function (c, b) {
                var a = this._getBytes(8, c, b), e = 1 - 2 * (a[0] >> 7), d = ((a[0] << 1 & 255) << 3 | a[1] >> 4) - (Math.pow(2, 10) - 1), a = (a[1] & 15) * Math.pow(2, 48) + a[2] * Math.pow(2, 40) + a[3] * Math.pow(2, 32) + a[4] * Math.pow(2, 24) + a[5] * Math.pow(2, 16) + a[6] * Math.pow(2, 8) + a[7];
                return 1024 ===
                    d ? 0 !== a ? NaN : Infinity * e : -1023 === d ? e * a * Math.pow(2, -1074) : e * (1 + a * Math.pow(2, -52)) * Math.pow(2, d)
            }, _getFloat32: function (c, b) {
                var a = this._getBytes(4, c, b), e = 1 - 2 * (a[0] >> 7), d = (a[0] << 1 & 255 | a[1] >> 7) - 127, a = (a[1] & 127) << 16 | a[2] << 8 | a[3];
                return 128 === d ? 0 !== a ? NaN : Infinity * e : -127 === d ? e * a * Math.pow(2, -149) : e * (1 + a * Math.pow(2, -23)) * Math.pow(2, d)
            }, _getInt32: function (c, b) {
                var a = this._getUint32(c, b);
                return a > Math.pow(2, 31) - 1 ? a - Math.pow(2, 32) : a
            }, _getUint32: function (c, b) {
                var a = this._getBytes(4, c, b);
                return a[0] * Math.pow(2, 24) +
                    (a[1] << 16) + (a[2] << 8) + a[3]
            }, _getInt16: function (c, b) {
                var a = this._getUint16(c, b);
                return a > Math.pow(2, 15) - 1 ? a - Math.pow(2, 16) : a
            }, _getUint16: function (c, b) {
                var a = this._getBytes(2, c, b);
                return(a[0] << 8) + a[1]
            }, _getInt8: function (c) {
                c = this._getUint8(c);
                return c > Math.pow(2, 7) - 1 ? c - Math.pow(2, 8) : c
            }, _getUint8: function (c) {
                return this._getBytes(1, c)[0]
            }};
            "undefined" !== typeof jQuery && "1.6.2" <= jQuery.fn.jquery && (jQuery.ajaxSetup({converters: {"* dataview": function (c) {
                return new b(c)
            }}, accepts: {dataview: "text/plain; charset=x-user-defined"},
                responseHandler: {dataview: function (c, b, a) {
                    var e;
                    if ("mozResponseArrayBuffer"in a)e = a.mozResponseArrayBuffer; else if ("responseType"in a && "arraybuffer" === a.responseType && a.response)e = a.response; else if ("responseBody"in a) {
                        b = a.responseBody;
                        try {
                            e = IEBinaryToArray_ByteStr(b)
                        } catch (d) {
                            window.execScript("Function IEBinaryToArray_ByteStr(Binary)\r\n\tIEBinaryToArray_ByteStr = CStr(Binary)\r\nEnd Function\r\nFunction IEBinaryToArray_ByteStr_Last(Binary)\r\n\tDim lastIndex\r\n\tlastIndex = LenB(Binary)\r\n\tif lastIndex mod 2 Then\r\n\t\tIEBinaryToArray_ByteStr_Last = AscB( MidB( Binary, lastIndex, 1 ) )\r\n\tElse\r\n\t\tIEBinaryToArray_ByteStr_Last = -1\r\n\tEnd If\r\nEnd Function\r\n",
                                "vbscript"), e = IEBinaryToArray_ByteStr(b)
                        }
                        for (var b = IEBinaryToArray_ByteStr_Last(b), a = "", j = 0, h = e.length % 8, g; j < h;)g = e.charCodeAt(j++), a += String.fromCharCode(g & 255, g >> 8);
                        for (h = e.length; j < h;)a += String.fromCharCode((g = e.charCodeAt(j++), g & 255), g >> 8, (g = e.charCodeAt(j++), g & 255), g >> 8, (g = e.charCodeAt(j++), g & 255), g >> 8, (g = e.charCodeAt(j++), g & 255), g >> 8, (g = e.charCodeAt(j++), g & 255), g >> 8, (g = e.charCodeAt(j++), g & 255), g >> 8, (g = e.charCodeAt(j++), g & 255), g >> 8, (g = e.charCodeAt(j++), g & 255), g >> 8);
                        -1 < b && (a += String.fromCharCode(b));
                        e = a
                    } else e = a.responseText;
                    c.text = e
                }}}), jQuery.ajaxPrefilter("dataview", function (c) {
                if (jQuery.support.ajaxResponseType) {
                    if (!c.hasOwnProperty("xhrFields"))c.xhrFields = {};
                    c.xhrFields.responseType = "arraybuffer"
                }
                c.mimeType = "text/plain; charset=x-user-defined"
            }));
            h.jDataView = (h.module || {}).exports = b;
            if ("undefined" !== typeof module)module.exports = b
        })(k);
        return k.jDataView
    })
}, "JBrowse/Model/BGZip/VirtualOffset": function () {
    define(["JBrowse/Util"], function (k) {
        return k.fastDeclare({constructor: function (h, i) {
            2 <=
                arguments.length ? (this.block = h, this.offset = i) : this._fromBytes(h)
        }, _fromBytes: function (h, i) {
            var i = i || 0, d = 1099511627776 * h[i] + 4294967296 * h[i + 1] + 16777216 * h[i + 2] + 65536 * h[i + 3] + 256 * h[i + 4] + h[i + 5], l = h[i + 6] << 8 | h[i + 7];
            0 == d && 0 == l ? this.block = this.offset = null : (this.block = d, this.offset = l)
        }, toString: function () {
            return"" + this.block + ":" + this.offset
        }, compareTo: function (h) {
            return this.block - h.block || this.offset - h.offset
        }, cmp: function (h) {
            return this.compareTo(h)
        }})
    })
}, "JBrowse/Store/SeqFeature/GlobalStatsEstimationMixin": function () {
    define(["dojo/_base/declare",
        "dojo/_base/array", "dojo/Deferred"], function (k, h, i) {
        return k(null, {_estimateGlobalStats: function () {
            var d = new i, l = function (c, b, a) {
                var e = this, d = 0.75 * c.start + 0.25 * c.end, j = Math.max(0, Math.round(d - b / 2)), i = Math.min(Math.round(d + b / 2), c.end), g = [];
                this._getFeatures({ref: c.name, start: j, end: i}, function (a) {
                    g.push(a)
                }, function () {
                    g = h.filter(g, function (a) {
                        return a.get("start") >= j && a.get("end") <= i
                    });
                    a.call(e, b, {featureDensity: g.length / b, _statsSampleFeatures: g.length, _statsSampleInterval: {ref: c.name, start: j, end: i,
                        length: b}})
                }, function (c) {
                    console.error(c);
                    a.call(e, b, null, c)
                })
            }, b = function (c, f, a) {
                if (a)d.reject(a); else {
                    var e = this.refSeq.end - this.refSeq.start;
                    300 <= f._statsSampleFeatures || 2 * c > e || a ? d.resolve(f) : l.call(this, this.refSeq, 2 * c, b)
                }
            };
            l.call(this, this.refSeq, 100, b);
            return d
        }})
    })
}, "JBrowse/Store/SeqFeature/VCFTabix/Parser": function () {
    define(["dojo/_base/declare", "dojo/_base/array", "dojo/json", "JBrowse/Digest/Crc32", "./LazyFeature"], function (k, h, i, d, l) {
        return k(null, {parseHeader: function (b) {
            for (var c = {}, b =
            {data: b, offset: 0}, f; f = this._getlineFromBytes(b);)if ("#" == f[0]) {
                var a = /^##([^\s#=]+)=(.+)/.exec(f);
                if (a && a[1])f = a[1].toLowerCase(), a = a[2] || "", a.match(/^<.+>$/) && (a = this._parseGenericHeaderLine(a)), c[f] || (c[f] = []), c[f].push(a); else if (/^#CHROM\t/.test(f) && (a = f.split("\t"), "FORMAT" == a[8] && 9 < a.length))c.samples = a.slice(9)
            }
            for (var e in c)dojo.isArray(c[e]) && "object" == typeof c[e][0] && "id"in c[e][0] && (c[e] = this._indexUniqObjects(c[e], "id"));
            return this.header = c
        }, lineToFeature: function (b) {
            for (var c = b.fields,
                     f = [], a = 0; a < c.length; a++)"." == c[a] && (c[a] = null);
            var e = c[3], a = c[4], d = this._find_SO_term(e, a), b = {start: b.start, end: b.start + e.length, seq_id: b.ref, description: this._makeDescriptionString(d, e, a), type: d, reference_allele: e};
            if (null !== c[2] && (f = (c[2] || "").split(";"), b.name = f[0], 1 < f.length))b.aliases = f.slice(1).join(",");
            if (null !== c[5])b.score = parseFloat(c[5]);
            if (null !== c[6])b.filter = c[6];
            if (a && "<" != a[0])b.alternative_alleles = {meta: {description: "VCF ALT field, list of alternate non-reference alleles called on at least one of the samples"},
                values: a};
            this._parseInfoField(b, c);
            return new l({id: f[0] || c.slice(0, 9).join("/"), data: b, fields: c, parser: this})
        }, _newlineCode: 10, _getlineFromBytes: function (b) {
            if (!b.offset)b.offset = 0;
            var c = h.indexOf(b.data, this._newlineCode, b.offset);
            if (-1 == c)return null;
            var f = String.fromCharCode.apply(String, Array.prototype.slice.call(b.data, b.offset, c));
            b.offset = c + 1;
            return f
        }, _parseGenericHeaderLine: function (b) {
            b = b.replace(/^<|>$/g, "");
            return this._parseKeyValue(b, ",", ";", "lowercase")
        }, _vcfReservedInfoFields: {AA: {description: "ancestral allele"},
            AC: {description: "allele count in genotypes, for each ALT allele, in the same order as listed"}, AF: {description: "allele frequency for each ALT allele in the same order as listed: use this when estimated from primary data, not called genotypes"}, AN: {description: "total number of alleles in called genotypes"}, BQ: {description: "RMS base quality at this position"}, CIGAR: {description: "cigar string describing how to align an alternate allele to the reference allele"}, DB: {description: "dbSNP membership"}, DP: {description: "combined depth across samples, e.g. DP=154"},
            END: {description: "end position of the variant described in this record (esp. for CNVs)"}, H2: {description: "membership in hapmap2"}, MQ: {description: "RMS mapping quality, e.g. MQ=52"}, MQ0: {description: "Number of MAPQ == 0 reads covering this record"}, NS: {description: "Number of samples with data"}, SB: {description: "strand bias at this position"}, SOMATIC: {description: "indicates that the record is a somatic mutation, for cancer genomics"}, VALIDATED: {description: "validated by follow-up experiment"}, IMPRECISE: {number: 0,
                type: "Flag", description: "Imprecise structural variation"}, NOVEL: {number: 0, type: "Flag", description: "Indicates a novel structural variation"}, END: {number: 1, type: "Integer", description: "End position of the variant described in this record"}, SVTYPE: {number: 1, type: "String", description: "Type of structural variant"}, SVLEN: {number: ".", type: "Integer", description: "Difference in length between REF and ALT alleles"}, CIPOS: {number: 2, type: "Integer", description: "Confidence interval around POS for imprecise variants"},
            CIEND: {number: 2, type: "Integer", description: "Confidence interval around END for imprecise variants"}, HOMLEN: {type: "Integer", description: "Length of base pair identical micro-homology at event breakpoints"}, HOMSEQ: {type: "String", description: "Sequence of base pair identical micro-homology at event breakpoints"}, BKPTID: {type: "String", description: "ID of the assembled alternate allele in the assembly file"}, MEINFO: {number: 4, type: "String", description: "Mobile element info of the form NAME,START,END,POLARITY"},
            METRANS: {number: 4, type: "String", description: "Mobile element transduction info of the form CHR,START,END,POLARITY"}, DGVID: {number: 1, type: "String", description: "ID of this element in Database of Genomic Variation"}, DBVARID: {number: 1, type: "String", description: "ID of this element in DBVAR"}, DBRIPID: {number: 1, type: "String", description: "ID of this element in DBRIP"}, MATEID: {type: "String", description: "ID of mate breakends"}, PARID: {number: 1, type: "String", description: "ID of partner breakend"}, EVENT: {number: 1,
                type: "String", description: "ID of event associated to breakend"}, CILEN: {number: 2, type: "Integer", description: "Confidence interval around the length of the inserted material between breakends"}, DP: {number: 1, type: "Integer", description: "Read Depth of segment containing breakend"}, DPADJ: {type: "Integer", description: "Read Depth of adjacency"}, CN: {number: 1, type: "Integer", description: "Copy number of segment containing breakend"}, CNADJ: {type: "Integer", description: "Copy number of adjacency"}, CICN: {number: 2, type: "Integer",
                description: "Confidence interval around copy number for the segment"}, CICNADJ: {type: "Integer", description: "Confidence interval around copy number for the adjacency"}}, _vcfStandardGenotypeFields: {GT: {description: "genotype, encoded as allele values separated by either of '/' or '|'. The allele values are 0 for the reference allele (what is in the REF field), 1 for the first allele listed in ALT, 2 for the second allele list in ALT and so on. For diploid calls examples could be 0/1, 1|0, or 1/2, etc. For haploid calls, e.g. on Y, male non-pseudoautosomal X, or mitochondrion, only one allele value should be given; a triploid call might look like 0/0/1. If a call cannot be made for a sample at a given locus, '.' should be specified for each missing allele in the GT field (for example './.' for a diploid genotype and '.' for haploid genotype). The meanings of the separators are as follows (see the PS field below for more details on incorporating phasing information into the genotypes): '/' meaning genotype unphased, '|' meaning genotype phased"},
            DP: {description: "read depth at this position for this sample (Integer)"}, FT: {description: 'sample genotype filter indicating if this genotype was "called" (similar in concept to the FILTER field). Again, use PASS to indicate that all filters have been passed, a semi-colon separated list of codes for filters that fail, or "." to indicate that filters have not been applied. These values should be described in the meta-information in the same way as FILTERs (String, no white-space or semi-colons permitted)'},
            GL: {description: "genotype likelihoods comprised of comma separated floating point log10-scaled likelihoods for all possible genotypes given the set of alleles defined in the REF and ALT fields. In presence of the GT field the same ploidy is expected and the canonical order is used; without GT field, diploidy is assumed. If A is the allele in REF and B,C,... are the alleles as ordered in ALT, the ordering of genotypes for the likelihoods is given by: F(j/k) = (k*(k+1)/2)+j.  In other words, for biallelic sites the ordering is: AA,AB,BB; for triallelic sites the ordering is: AA,AB,BB,AC,BC,CC, etc.  For example: GT:GL 0/1:-323.03,-99.29,-802.53 (Floats)"},
            GLE: {description: "genotype likelihoods of heterogeneous ploidy, used in presence of uncertain copy number. For example: GLE=0:-75.22,1:-223.42,0/0:-323.03,1/0:-99.29,1/1:-802.53 (String)"}, PL: {description: "the phred-scaled genotype likelihoods rounded to the closest integer (and otherwise defined precisely as the GL field) (Integers)"}, GP: {description: "the phred-scaled genotype posterior probabilities (and otherwise defined precisely as the GL field); intended to store imputed genotype probabilities (Floats)"},
            GQ: {description: "conditional genotype quality, encoded as a phred quality -10log_10p(genotype call is wrong, conditioned on the site's being variant) (Integer)"}, HQ: {description: "haplotype qualities, two comma separated phred qualities (Integers)"}, PS: {description: "phase set.  A phase set is defined as a set of phased genotypes to which this genotype belongs.  Phased genotypes for an individual that are on the same chromosome and have the same PS value are in the same phased set.  A phase set specifies multi-marker haplotypes for the phased genotypes in the set.  All phased genotypes that do not contain a PS subfield are assumed to belong to the same phased set.  If the genotype in the GT field is unphased, the corresponding PS field is ignored.  The recommended convention is to use the position of the first variant in the set as the PS identifier (although this is not required). (Non-negative 32-bit Integer)"},
            PQ: {description: 'phasing quality, the phred-scaled probability that alleles are ordered incorrectly in a heterozygote (against all other members in the phase set).  We note that we have not yet included the specific measure for precisely defining "phasing quality"; our intention for now is simply to reserve the PQ tag for future use as a measure of phasing quality. (Integer)'}, EC: {description: "comma separated list of expected alternate allele counts for each alternate allele in the same order as listed in the ALT field (typically used in association analyses) (Integers)"},
            MQ: {description: "RMS mapping quality, similar to the version in the INFO field. (Integer)"}}, _vcfReservedAltTypes: {DEL: {description: "Deletion relative to the reference", so_term: "deletion"}, INS: {description: "Insertion of novel sequence relative to the reference", so_term: "insertion"}, DUP: {description: "Region of elevated copy number relative to the reference", so_term: "copy_number_gain"}, INV: {description: "Inversion of reference sequence", so_term: "inversion"}, CNV: {description: "Copy number variable region (may be both deletion and duplication)",
            so_term: "copy_number_variation"}, "DUP:TANDEM": {description: "Tandem duplication", so_term: "copy_number_gain"}, "DEL:ME": {description: "Deletion of mobile element relative to the reference"}, "INS:ME": {description: "Insertion of a mobile element relative to the reference"}}, _parseInfoField: function (b, c) {
            if (c[7] && "." != c[7]) {
                var f = this._parseKeyValue(c[7]), a;
                for (a in f)if (f.hasOwnProperty(a)) {
                    var e = f[a] = {values: f[a], toString: function () {
                        return(this.values || []).join(",")
                    }}, d = this._getInfoMeta(a);
                    if (d)e.meta =
                        d
                }
                dojo.mixin(b, f)
            }
        }, _getAltMeta: function (b) {
            return(this.header.alt || {})[b] || this._vcfReservedAltTypes[b]
        }, _getInfoMeta: function (b) {
            return(this.header.info || {})[b] || this._vcfReservedInfoFields[b]
        }, _getFormatMeta: function (b) {
            return(this.header.format || {})[b] || this._vcfStandardGenotypeFields[b]
        }, _indexUniqObjects: function (b, c, f) {
            var a = {};
            h.forEach(b, function (b) {
                var d = b[c];
                dojo.isArray(d) && (d = d[0]);
                f && d.toLowerCase();
                a[b[c]] = b
            });
            return a
        }, _parseKeyValue: function (b, c, d, a) {
            for (var c = c || ";", d = d || ",", e = {},
                     h = "", j = "", i = 1, g = 0; g < b.length; g++)1 == i ? "=" == b[g] ? (a && (h = h.toLowerCase()), e[h] = [], i = 2) : b[g] == c ? (a && (h = h.toLowerCase()), e[h] = [!0], h = "", i = 1) : h += b[g] : 2 == i ? b[g] == d ? (e[h].push(j), j = "") : b[g] == c ? (e[h].push(j), h = "", i = 1, j = "") : '"' == b[g] ? (i = 3, j = "") : j += b[g] : 3 == i && ('"' != b[g] ? j += b[g] : i = 2);
            (2 == i || 3 == i) && e[h].push(j);
            return e
        }, _find_SO_term: function (b, c) {
            if (!c || "." == c)return"remark";
            var d = h.filter(h.map(c.split(","), function (a) {
                return this._find_SO_term_from_alt_definitions(a)
            }, this), function (a) {
                return a
            });
            return d[0] ?
                d.join(",") : this._find_SO_term_by_examination(b, c)
        }, _makeDescriptionString: function (b, c, d) {
            if (!d)return"no alternative alleles";
            var d = d.replace(/^<|>$/g, ""), a = this._getAltMeta(d);
            return a && a.description ? d + " - " + a.description : b + " " + c + " -> " + d
        }, _find_SO_term_from_alt_definitions: function (b) {
            if ("<" != b[0])return null;
            var b = b.replace(/^<|>$/g, ""), c = (this.header.alt || {})[b] || this._vcfReservedAltTypes[b];
            if (c && c.so_term)return c.so_term;
            b = b.split(":");
            return 1 < b.length ? this._find_SO_term_from_alt_definitions("<" +
                b.slice(0, b.length - 1).join(":") + ">") : null
        }, _find_SO_term_by_examination: function (b, c) {
            var c = c.split(","), d = Infinity, a = -Infinity;
            h.map(c, function (b) {
                var c = b.length;
                c < d && (d = c);
                c > a && (a = c);
                return b.length
            });
            return 1 == b.length && 1 == d && 1 == a ? "SNV" : b.length == d && b.length == a ? 1 == c.length && b.split("").reverse().join("") == c[0] ? "inversion" : "substitution" : b.length <= d && b.length < a ? "insertion" : b.length > d && b.length >= a ? "deletion" : "indel"
        }})
    })
}, "JBrowse/Store/SeqFeature/VCFTabix/LazyFeature": function () {
    define(["dojo/_base/array",
        "dojo/json", "JBrowse/Util"], function (k, h, i) {
        return i.fastDeclare({constructor: function (d) {
            this.parser = d.parser;
            this.data = d.data;
            this._id = d.id;
            this.fields = d.fields
        }, get: function (d) {
            return this._get(d) || this._get(d.toLowerCase())
        }, _get: function (d) {
            return d in this.data ? this.data[d] : this.data[d] = this["_parse_" + d] ? this["_parse_" + d]() : void 0
        }, parent: function () {
            return null
        }, children: function () {
            return null
        }, tags: function () {
            var d = [], h = this.data, b;
            for (b in h)h.hasOwnProperty(b) && d.push(b);
            h.genotypes || d.push("genotypes");
            return d
        }, id: function () {
            return this._id
        }, _parse_genotypes: function () {
            var d = this.fields, h = this.parser;
            delete this.fields;
            delete this.parser;
            if (10 > d.length)return null;
            for (var b = [], c = k.map(d[8].split(":"), function (a) {
                return{id: a, meta: h._getFormatMeta(a)}
            }, this), f = 9; f < d.length; ++f) {
                for (var a = (d[f] || "").split(":"), e = {}, i = 0; i < c.length; ++i) {
                    var j = a[i] || "";
                    e[c[i].id] = {values: '"' == j.charAt(0) ? [j] : j.split(","), meta: c[i].meta}
                }
                b.push(e)
            }
            d = {};
            for (f = 0; f < b.length; f++)(c = (h.header.samples || {})[f]) && (d[c] = b[f]);
            d.toString = this._stringifySample;
            return d
        }, _stringifySample: function () {
            var d = {}, i;
            for (i in this) {
                var b = d[i] = {}, c;
                for (c in this[i])b[c] = this[i][c].values
            }
            return(JSON || h).stringify(d)
        }})
    })
}}});
define("JBrowse/Store/SeqFeature/VCFTabix", "dojo/_base/declare,dojo/_base/lang,dojo/Deferred,JBrowse/Store/SeqFeature,JBrowse/Store/DeferredStatsMixin,JBrowse/Store/DeferredFeaturesMixin,JBrowse/Store/TabixIndexedFile,JBrowse/Store/SeqFeature/GlobalStatsEstimationMixin,JBrowse/Model/XHRBlob,./VCFTabix/Parser".split(","), function (k, h, i, d, l, b, c, f, a, e) {
    var n = k(c, {parseItem: function () {
        var a = this.inherited(arguments);
        if (a)a.start--, a.end = a.start + a.fields[3].length;
        return a
    }});
    return k([d, l, b, f, e], {constructor: function (b) {
        var c =
            this, d = b.tbi || new a(this.resolveUrl(this.getConf("tbiUrlTemplate", []) || this.getConf("urlTemplate", []) + ".tbi")), e = b.file || new a(this.resolveUrl(this.getConf("urlTemplate", [])));
        this.indexedData = new n({tbi: d, file: e, browser: this.browser, chunkSizeLimit: b.chunkSizeLimit});
        this._loadHeader().then(function () {
            c._deferred.features.resolve({success: !0});
            c._estimateGlobalStats().then(function (a) {
                c.globalStats = a;
                c._deferred.stats.resolve(a)
            }, h.hitch(c, "_failAllDeferred"))
        }, h.hitch(c, "_failAllDeferred"))
    }, _loadHeader: function () {
        var a =
            this;
        return this._parsedHeader = this._parsedHeader || function () {
            var b = new i;
            a.indexedData.indexLoaded.then(function () {
                a.indexedData.data.read(0, a.indexedData.index.firstDataLine ? a.indexedData.index.firstDataLine.block + a.indexedData.data.blockSize - 1 : null, function (c) {
                    a.parseHeader(new Uint8Array(c));
                    b.resolve({success: !0})
                }, h.hitch(b, "reject"))
            }, h.hitch(b, "reject"));
            return b
        }.call()
    }, _getFeatures: function (a, b, c, d) {
        var e = this;
        e._loadHeader().then(function () {
            e.indexedData.getLines(a.ref || e.refSeq.name,
                a.start, a.end, function (a) {
                    a = e.lineToFeature(a);
                    b(a)
                }, c, d)
        }, d)
    }, hasRefSeq: function (a, b, c) {
        return this.indexedData.index.hasRefSeq(a, b, c)
    }})
});
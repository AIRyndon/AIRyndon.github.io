(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __require = (x) => {
    if (typeof require !== "undefined")
      return require(x);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  };
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // node_modules/fuzzysort/fuzzysort.js
  var require_fuzzysort = __commonJS({
    "node_modules/fuzzysort/fuzzysort.js"(exports, module) {
      (function(root, UMD) {
        if (typeof define === "function" && define.amd)
          define([], UMD);
        else if (typeof module === "object" && module.exports)
          module.exports = UMD();
        else
          root.fuzzysort = UMD();
      })(exports, function UMD() {
        function fuzzysortNew(instanceOptions) {
          var fuzzysort = {
            single: function(search, target, options) {
              if (!search)
                return null;
              if (!isObj(search))
                search = fuzzysort.getPreparedSearch(search);
              if (!target)
                return null;
              if (!isObj(target))
                target = fuzzysort.getPrepared(target);
              var allowTypo = options && options.allowTypo !== void 0 ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== void 0 ? instanceOptions.allowTypo : true;
              var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
              return algorithm(search, target, search[0]);
            },
            go: function(search, targets, options) {
              if (!search)
                return noResults;
              search = fuzzysort.prepareSearch(search);
              var searchLowerCode = search[0];
              var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
              var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
              var allowTypo = options && options.allowTypo !== void 0 ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== void 0 ? instanceOptions.allowTypo : true;
              var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
              var resultsLen = 0;
              var limitedCount = 0;
              var targetsLen = targets.length;
              if (options && options.keys) {
                var scoreFn = options.scoreFn || defaultScoreFn;
                var keys = options.keys;
                var keysLen = keys.length;
                for (var i = targetsLen - 1; i >= 0; --i) {
                  var obj = targets[i];
                  var objResults = new Array(keysLen);
                  for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
                    var key = keys[keyI];
                    var target = getValue(obj, key);
                    if (!target) {
                      objResults[keyI] = null;
                      continue;
                    }
                    if (!isObj(target))
                      target = fuzzysort.getPrepared(target);
                    objResults[keyI] = algorithm(search, target, searchLowerCode);
                  }
                  objResults.obj = obj;
                  var score = scoreFn(objResults);
                  if (score === null)
                    continue;
                  if (score < threshold)
                    continue;
                  objResults.score = score;
                  if (resultsLen < limit) {
                    q.add(objResults);
                    ++resultsLen;
                  } else {
                    ++limitedCount;
                    if (score > q.peek().score)
                      q.replaceTop(objResults);
                  }
                }
              } else if (options && options.key) {
                var key = options.key;
                for (var i = targetsLen - 1; i >= 0; --i) {
                  var obj = targets[i];
                  var target = getValue(obj, key);
                  if (!target)
                    continue;
                  if (!isObj(target))
                    target = fuzzysort.getPrepared(target);
                  var result = algorithm(search, target, searchLowerCode);
                  if (result === null)
                    continue;
                  if (result.score < threshold)
                    continue;
                  result = { target: result.target, _targetLowerCodes: null, _nextBeginningIndexes: null, score: result.score, indexes: result.indexes, obj };
                  if (resultsLen < limit) {
                    q.add(result);
                    ++resultsLen;
                  } else {
                    ++limitedCount;
                    if (result.score > q.peek().score)
                      q.replaceTop(result);
                  }
                }
              } else {
                for (var i = targetsLen - 1; i >= 0; --i) {
                  var target = targets[i];
                  if (!target)
                    continue;
                  if (!isObj(target))
                    target = fuzzysort.getPrepared(target);
                  var result = algorithm(search, target, searchLowerCode);
                  if (result === null)
                    continue;
                  if (result.score < threshold)
                    continue;
                  if (resultsLen < limit) {
                    q.add(result);
                    ++resultsLen;
                  } else {
                    ++limitedCount;
                    if (result.score > q.peek().score)
                      q.replaceTop(result);
                  }
                }
              }
              if (resultsLen === 0)
                return noResults;
              var results = new Array(resultsLen);
              for (var i = resultsLen - 1; i >= 0; --i)
                results[i] = q.poll();
              results.total = resultsLen + limitedCount;
              return results;
            },
            goAsync: function(search, targets, options) {
              var canceled = false;
              var p = new Promise(function(resolve, reject) {
                if (!search)
                  return resolve(noResults);
                search = fuzzysort.prepareSearch(search);
                var searchLowerCode = search[0];
                var q2 = fastpriorityqueue();
                var iCurrent = targets.length - 1;
                var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
                var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
                var allowTypo = options && options.allowTypo !== void 0 ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== void 0 ? instanceOptions.allowTypo : true;
                var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
                var resultsLen = 0;
                var limitedCount = 0;
                function step() {
                  if (canceled)
                    return reject("canceled");
                  var startMs = Date.now();
                  if (options && options.keys) {
                    var scoreFn = options.scoreFn || defaultScoreFn;
                    var keys = options.keys;
                    var keysLen = keys.length;
                    for (; iCurrent >= 0; --iCurrent) {
                      var obj = targets[iCurrent];
                      var objResults = new Array(keysLen);
                      for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
                        var key = keys[keyI];
                        var target = getValue(obj, key);
                        if (!target) {
                          objResults[keyI] = null;
                          continue;
                        }
                        if (!isObj(target))
                          target = fuzzysort.getPrepared(target);
                        objResults[keyI] = algorithm(search, target, searchLowerCode);
                      }
                      objResults.obj = obj;
                      var score = scoreFn(objResults);
                      if (score === null)
                        continue;
                      if (score < threshold)
                        continue;
                      objResults.score = score;
                      if (resultsLen < limit) {
                        q2.add(objResults);
                        ++resultsLen;
                      } else {
                        ++limitedCount;
                        if (score > q2.peek().score)
                          q2.replaceTop(objResults);
                      }
                      if (iCurrent % 1e3 === 0) {
                        if (Date.now() - startMs >= 10) {
                          isNode ? setImmediate(step) : setTimeout(step);
                          return;
                        }
                      }
                    }
                  } else if (options && options.key) {
                    var key = options.key;
                    for (; iCurrent >= 0; --iCurrent) {
                      var obj = targets[iCurrent];
                      var target = getValue(obj, key);
                      if (!target)
                        continue;
                      if (!isObj(target))
                        target = fuzzysort.getPrepared(target);
                      var result = algorithm(search, target, searchLowerCode);
                      if (result === null)
                        continue;
                      if (result.score < threshold)
                        continue;
                      result = { target: result.target, _targetLowerCodes: null, _nextBeginningIndexes: null, score: result.score, indexes: result.indexes, obj };
                      if (resultsLen < limit) {
                        q2.add(result);
                        ++resultsLen;
                      } else {
                        ++limitedCount;
                        if (result.score > q2.peek().score)
                          q2.replaceTop(result);
                      }
                      if (iCurrent % 1e3 === 0) {
                        if (Date.now() - startMs >= 10) {
                          isNode ? setImmediate(step) : setTimeout(step);
                          return;
                        }
                      }
                    }
                  } else {
                    for (; iCurrent >= 0; --iCurrent) {
                      var target = targets[iCurrent];
                      if (!target)
                        continue;
                      if (!isObj(target))
                        target = fuzzysort.getPrepared(target);
                      var result = algorithm(search, target, searchLowerCode);
                      if (result === null)
                        continue;
                      if (result.score < threshold)
                        continue;
                      if (resultsLen < limit) {
                        q2.add(result);
                        ++resultsLen;
                      } else {
                        ++limitedCount;
                        if (result.score > q2.peek().score)
                          q2.replaceTop(result);
                      }
                      if (iCurrent % 1e3 === 0) {
                        if (Date.now() - startMs >= 10) {
                          isNode ? setImmediate(step) : setTimeout(step);
                          return;
                        }
                      }
                    }
                  }
                  if (resultsLen === 0)
                    return resolve(noResults);
                  var results = new Array(resultsLen);
                  for (var i = resultsLen - 1; i >= 0; --i)
                    results[i] = q2.poll();
                  results.total = resultsLen + limitedCount;
                  resolve(results);
                }
                isNode ? setImmediate(step) : step();
              });
              p.cancel = function() {
                canceled = true;
              };
              return p;
            },
            highlight: function(result, hOpen, hClose) {
              if (result === null)
                return null;
              if (hOpen === void 0)
                hOpen = "<b>";
              if (hClose === void 0)
                hClose = "</b>";
              var highlighted = "";
              var matchesIndex = 0;
              var opened = false;
              var target = result.target;
              var targetLen = target.length;
              var matchesBest = result.indexes;
              for (var i = 0; i < targetLen; ++i) {
                var char = target[i];
                if (matchesBest[matchesIndex] === i) {
                  ++matchesIndex;
                  if (!opened) {
                    opened = true;
                    highlighted += hOpen;
                  }
                  if (matchesIndex === matchesBest.length) {
                    highlighted += char + hClose + target.substr(i + 1);
                    break;
                  }
                } else {
                  if (opened) {
                    opened = false;
                    highlighted += hClose;
                  }
                }
                highlighted += char;
              }
              return highlighted;
            },
            prepare: function(target) {
              if (!target)
                return;
              return { target, _targetLowerCodes: fuzzysort.prepareLowerCodes(target), _nextBeginningIndexes: null, score: null, indexes: null, obj: null };
            },
            prepareSlow: function(target) {
              if (!target)
                return;
              return { target, _targetLowerCodes: fuzzysort.prepareLowerCodes(target), _nextBeginningIndexes: fuzzysort.prepareNextBeginningIndexes(target), score: null, indexes: null, obj: null };
            },
            prepareSearch: function(search) {
              if (!search)
                return;
              return fuzzysort.prepareLowerCodes(search);
            },
            getPrepared: function(target) {
              if (target.length > 999)
                return fuzzysort.prepare(target);
              var targetPrepared = preparedCache.get(target);
              if (targetPrepared !== void 0)
                return targetPrepared;
              targetPrepared = fuzzysort.prepare(target);
              preparedCache.set(target, targetPrepared);
              return targetPrepared;
            },
            getPreparedSearch: function(search) {
              if (search.length > 999)
                return fuzzysort.prepareSearch(search);
              var searchPrepared = preparedSearchCache.get(search);
              if (searchPrepared !== void 0)
                return searchPrepared;
              searchPrepared = fuzzysort.prepareSearch(search);
              preparedSearchCache.set(search, searchPrepared);
              return searchPrepared;
            },
            algorithm: function(searchLowerCodes, prepared, searchLowerCode) {
              var targetLowerCodes = prepared._targetLowerCodes;
              var searchLen = searchLowerCodes.length;
              var targetLen = targetLowerCodes.length;
              var searchI = 0;
              var targetI = 0;
              var typoSimpleI = 0;
              var matchesSimpleLen = 0;
              for (; ; ) {
                var isMatch = searchLowerCode === targetLowerCodes[targetI];
                if (isMatch) {
                  matchesSimple[matchesSimpleLen++] = targetI;
                  ++searchI;
                  if (searchI === searchLen)
                    break;
                  searchLowerCode = searchLowerCodes[typoSimpleI === 0 ? searchI : typoSimpleI === searchI ? searchI + 1 : typoSimpleI === searchI - 1 ? searchI - 1 : searchI];
                }
                ++targetI;
                if (targetI >= targetLen) {
                  for (; ; ) {
                    if (searchI <= 1)
                      return null;
                    if (typoSimpleI === 0) {
                      --searchI;
                      var searchLowerCodeNew = searchLowerCodes[searchI];
                      if (searchLowerCode === searchLowerCodeNew)
                        continue;
                      typoSimpleI = searchI;
                    } else {
                      if (typoSimpleI === 1)
                        return null;
                      --typoSimpleI;
                      searchI = typoSimpleI;
                      searchLowerCode = searchLowerCodes[searchI + 1];
                      var searchLowerCodeNew = searchLowerCodes[searchI];
                      if (searchLowerCode === searchLowerCodeNew)
                        continue;
                    }
                    matchesSimpleLen = searchI;
                    targetI = matchesSimple[matchesSimpleLen - 1] + 1;
                    break;
                  }
                }
              }
              var searchI = 0;
              var typoStrictI = 0;
              var successStrict = false;
              var matchesStrictLen = 0;
              var nextBeginningIndexes = prepared._nextBeginningIndexes;
              if (nextBeginningIndexes === null)
                nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);
              var firstPossibleI = targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];
              if (targetI !== targetLen)
                for (; ; ) {
                  if (targetI >= targetLen) {
                    if (searchI <= 0) {
                      ++typoStrictI;
                      if (typoStrictI > searchLen - 2)
                        break;
                      if (searchLowerCodes[typoStrictI] === searchLowerCodes[typoStrictI + 1])
                        continue;
                      targetI = firstPossibleI;
                      continue;
                    }
                    --searchI;
                    var lastMatch = matchesStrict[--matchesStrictLen];
                    targetI = nextBeginningIndexes[lastMatch];
                  } else {
                    var isMatch = searchLowerCodes[typoStrictI === 0 ? searchI : typoStrictI === searchI ? searchI + 1 : typoStrictI === searchI - 1 ? searchI - 1 : searchI] === targetLowerCodes[targetI];
                    if (isMatch) {
                      matchesStrict[matchesStrictLen++] = targetI;
                      ++searchI;
                      if (searchI === searchLen) {
                        successStrict = true;
                        break;
                      }
                      ++targetI;
                    } else {
                      targetI = nextBeginningIndexes[targetI];
                    }
                  }
                }
              {
                if (successStrict) {
                  var matchesBest = matchesStrict;
                  var matchesBestLen = matchesStrictLen;
                } else {
                  var matchesBest = matchesSimple;
                  var matchesBestLen = matchesSimpleLen;
                }
                var score = 0;
                var lastTargetI = -1;
                for (var i = 0; i < searchLen; ++i) {
                  var targetI = matchesBest[i];
                  if (lastTargetI !== targetI - 1)
                    score -= targetI;
                  lastTargetI = targetI;
                }
                if (!successStrict) {
                  score *= 1e3;
                  if (typoSimpleI !== 0)
                    score += -20;
                } else {
                  if (typoStrictI !== 0)
                    score += -20;
                }
                score -= targetLen - searchLen;
                prepared.score = score;
                prepared.indexes = new Array(matchesBestLen);
                for (var i = matchesBestLen - 1; i >= 0; --i)
                  prepared.indexes[i] = matchesBest[i];
                return prepared;
              }
            },
            algorithmNoTypo: function(searchLowerCodes, prepared, searchLowerCode) {
              var targetLowerCodes = prepared._targetLowerCodes;
              var searchLen = searchLowerCodes.length;
              var targetLen = targetLowerCodes.length;
              var searchI = 0;
              var targetI = 0;
              var matchesSimpleLen = 0;
              for (; ; ) {
                var isMatch = searchLowerCode === targetLowerCodes[targetI];
                if (isMatch) {
                  matchesSimple[matchesSimpleLen++] = targetI;
                  ++searchI;
                  if (searchI === searchLen)
                    break;
                  searchLowerCode = searchLowerCodes[searchI];
                }
                ++targetI;
                if (targetI >= targetLen)
                  return null;
              }
              var searchI = 0;
              var successStrict = false;
              var matchesStrictLen = 0;
              var nextBeginningIndexes = prepared._nextBeginningIndexes;
              if (nextBeginningIndexes === null)
                nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);
              var firstPossibleI = targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];
              if (targetI !== targetLen)
                for (; ; ) {
                  if (targetI >= targetLen) {
                    if (searchI <= 0)
                      break;
                    --searchI;
                    var lastMatch = matchesStrict[--matchesStrictLen];
                    targetI = nextBeginningIndexes[lastMatch];
                  } else {
                    var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];
                    if (isMatch) {
                      matchesStrict[matchesStrictLen++] = targetI;
                      ++searchI;
                      if (searchI === searchLen) {
                        successStrict = true;
                        break;
                      }
                      ++targetI;
                    } else {
                      targetI = nextBeginningIndexes[targetI];
                    }
                  }
                }
              {
                if (successStrict) {
                  var matchesBest = matchesStrict;
                  var matchesBestLen = matchesStrictLen;
                } else {
                  var matchesBest = matchesSimple;
                  var matchesBestLen = matchesSimpleLen;
                }
                var score = 0;
                var lastTargetI = -1;
                for (var i = 0; i < searchLen; ++i) {
                  var targetI = matchesBest[i];
                  if (lastTargetI !== targetI - 1)
                    score -= targetI;
                  lastTargetI = targetI;
                }
                if (!successStrict)
                  score *= 1e3;
                score -= targetLen - searchLen;
                prepared.score = score;
                prepared.indexes = new Array(matchesBestLen);
                for (var i = matchesBestLen - 1; i >= 0; --i)
                  prepared.indexes[i] = matchesBest[i];
                return prepared;
              }
            },
            prepareLowerCodes: function(str) {
              var strLen = str.length;
              var lowerCodes = [];
              var lower = str.toLowerCase();
              for (var i = 0; i < strLen; ++i)
                lowerCodes[i] = lower.charCodeAt(i);
              return lowerCodes;
            },
            prepareBeginningIndexes: function(target) {
              var targetLen = target.length;
              var beginningIndexes = [];
              var beginningIndexesLen = 0;
              var wasUpper = false;
              var wasAlphanum = false;
              for (var i = 0; i < targetLen; ++i) {
                var targetCode = target.charCodeAt(i);
                var isUpper = targetCode >= 65 && targetCode <= 90;
                var isAlphanum = isUpper || targetCode >= 97 && targetCode <= 122 || targetCode >= 48 && targetCode <= 57;
                var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;
                wasUpper = isUpper;
                wasAlphanum = isAlphanum;
                if (isBeginning)
                  beginningIndexes[beginningIndexesLen++] = i;
              }
              return beginningIndexes;
            },
            prepareNextBeginningIndexes: function(target) {
              var targetLen = target.length;
              var beginningIndexes = fuzzysort.prepareBeginningIndexes(target);
              var nextBeginningIndexes = [];
              var lastIsBeginning = beginningIndexes[0];
              var lastIsBeginningI = 0;
              for (var i = 0; i < targetLen; ++i) {
                if (lastIsBeginning > i) {
                  nextBeginningIndexes[i] = lastIsBeginning;
                } else {
                  lastIsBeginning = beginningIndexes[++lastIsBeginningI];
                  nextBeginningIndexes[i] = lastIsBeginning === void 0 ? targetLen : lastIsBeginning;
                }
              }
              return nextBeginningIndexes;
            },
            cleanup,
            new: fuzzysortNew
          };
          return fuzzysort;
        }
        var isNode = typeof __require !== "undefined" && typeof window === "undefined";
        var preparedCache = new Map();
        var preparedSearchCache = new Map();
        var noResults = [];
        noResults.total = 0;
        var matchesSimple = [];
        var matchesStrict = [];
        function cleanup() {
          preparedCache.clear();
          preparedSearchCache.clear();
          matchesSimple = [];
          matchesStrict = [];
        }
        function defaultScoreFn(a) {
          var max = -9007199254740991;
          for (var i = a.length - 1; i >= 0; --i) {
            var result = a[i];
            if (result === null)
              continue;
            var score = result.score;
            if (score > max)
              max = score;
          }
          if (max === -9007199254740991)
            return null;
          return max;
        }
        function getValue(obj, prop) {
          var tmp = obj[prop];
          if (tmp !== void 0)
            return tmp;
          var segs = prop;
          if (!Array.isArray(prop))
            segs = prop.split(".");
          var len = segs.length;
          var i = -1;
          while (obj && ++i < len)
            obj = obj[segs[i]];
          return obj;
        }
        function isObj(x) {
          return typeof x === "object";
        }
        var fastpriorityqueue = function() {
          var r = [], o = 0, e = {};
          function n() {
            for (var e2 = 0, n2 = r[e2], c = 1; c < o; ) {
              var f = c + 1;
              e2 = c, f < o && r[f].score < r[c].score && (e2 = f), r[e2 - 1 >> 1] = r[e2], c = 1 + (e2 << 1);
            }
            for (var a = e2 - 1 >> 1; e2 > 0 && n2.score < r[a].score; a = (e2 = a) - 1 >> 1)
              r[e2] = r[a];
            r[e2] = n2;
          }
          return e.add = function(e2) {
            var n2 = o;
            r[o++] = e2;
            for (var c = n2 - 1 >> 1; n2 > 0 && e2.score < r[c].score; c = (n2 = c) - 1 >> 1)
              r[n2] = r[c];
            r[n2] = e2;
          }, e.poll = function() {
            if (o !== 0) {
              var e2 = r[0];
              return r[0] = r[--o], n(), e2;
            }
          }, e.peek = function(e2) {
            if (o !== 0)
              return r[0];
          }, e.replaceTop = function(o2) {
            r[0] = o2, n();
          }, e;
        };
        var q = fastpriorityqueue();
        return fuzzysortNew();
      });
    }
  });

  // <stdin>
  var import_fuzzysort = __toModule(require_fuzzysort());
  (() => {
    let searchIndex = null;
    const searchContainer = document.getElementById("search-result");
    const fuzzySearch = async (query, index) => {
      const result = await import_fuzzysort.default.goAsync(query, index, {
        allowTypo: false,
        limit: 5,
        threshold: -1e4,
        key: "title"
      });
      if (result.length > 0) {
        const div = document.createElement("div");
        div.setAttribute("class", "box");
        result.forEach((item) => {
          const aTag = document.createElement("a");
          aTag.setAttribute("href", item.obj.permalink);
          aTag.setAttribute("class", "has-text-primary block is-block");
          aTag.innerHTML = item.obj.title;
          div.appendChild(aTag);
        });
        return div;
      }
      return null;
    };
    document.getElementById("search-input").addEventListener("input", async (e) => {
      const result = await fuzzySearch(e.currentTarget.value, searchIndex);
      const searchContainer2 = document.getElementById("search-result");
      if (searchContainer2.lastChild)
        searchContainer2.removeChild(searchContainer2.lastChild);
      if (result)
        searchContainer2.appendChild(result);
    });
    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status === 200) {
        searchIndex = JSON.parse(request.responseText);
      }
    };
    request.open("GET", "/index.json");
    request.send();
  })();
})();

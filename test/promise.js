"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("promise", function () {

    function generateTests (PromiseClass) {

        describe("simple usage", function () {

            it("waits for synchronous fulfilment", function (done) {
                new PromiseClass(function (resolve/*, reject*/) {
                    assert("function" === typeof resolve);
                    resolve("ok");
                })
                    .then(function (value) {
                        assert("ok" === value);
                        done();
                    });
            });

            it("waits for asynchronous fulfilment", function (done) {
                new PromiseClass(function (resolve/*, reject*/) {
                    assert("function" === typeof resolve);
                    setTimeout(function () {
                        resolve("ok");
                    });
                })
                    .then(function (value) {
                        assert("ok" === value);
                        done();
                    });
            });

            it("waits for synchronous rejection (rejection handler)", function (done) {
                var fulfilled = false;
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    reject("ko");
                })
                    .then(function () {
                        fulfilled = true;
                    }, function (reason) {
                        assert(false === fulfilled);
                        assert("ko" === reason);
                        done();
                    })["catch"](function (/*reason*/) {
                        assert(false);
                    });
            });

            it("waits for asynchronous rejection (rejection handler)", function (done) {
                var fulfilled = false;
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    setTimeout(function () {
                        reject("ko");
                    });
                })
                    .then(function () {
                        fulfilled = true;
                    }, function (reason) {
                        assert(false === fulfilled);
                        assert("ko" === reason);
                        done();
                    })["catch"](function (/*reason*/) {
                        assert(false);
                    });
            });

            it("waits for synchronous rejection (catch handler)", function (done) {
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    reject("ko");
                })
                    .then(function () {
                        assert(false);
                    })["catch"](function (reason) {
                        assert("ko" === reason);
                        done();
                    });
            });

            it("waits for asynchronous rejection (catch handler)", function (done) {
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    setTimeout(function () {
                        reject("ko");
                    });
                })
                    .then(function () {
                        assert(false);
                    })["catch"](function (reason) {
                        assert("ko" === reason);
                        done();
                    });
            });

            it("rejects automatically on exception", function (done) {
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    throw new Error("ko");
                })
                    .then(function () {
                        assert(false);
                    }, function (reason) {
                        assert(reason instanceof Error);
                        assert("ko" === reason.message);
                        done();
                    });
            });

            it("catches exception from the fulfilment handler", function (done) {
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    setTimeout(function () {
                        resolve("ok");
                    });
                })
                    .then(function (value) {
                        assert("ok" === value);
                        throw new Error("ko");
                    })["catch"](function (reason) {
                        assert(reason instanceof Error);
                        assert("ko" === reason.message);
                        done();
                    });
            });

            it("catches exception from the rejection handler", function (done) {
                new PromiseClass(function (resolve, reject) {
                    assert("function" === typeof resolve);
                    assert("function" === typeof reject);
                    setTimeout(function () {
                        reject("ko");
                    });
                })
                    .then(function () {
                        assert(false);
                    }, function (reason) {
                        assert("ko" === reason);
                        throw new Error("ko");
                    })["catch"](function (reason) {
                        assert(reason instanceof Error);
                        assert("ko" === reason.message);
                        done();
                    });
            });

        });

        describe("shortcuts", function () {

            it("offers Promise.resolve", function (done) {
                PromiseClass.resolve("ok")
                    .then(function (value) {
                        assert("ok" === value);
                        done();
                    }, function (/*reason*/) {
                        assert(false);
                    });
            });

            it("offers Promise.reject", function (done) {
                PromiseClass.reject("ko")
                    .then(function (/*value*/) {
                        assert(false);
                    }, function (reason) {
                        assert("ko" === reason);
                        done();
                    });
            });

        });

        describe("chaining", function () {

            it("chains by passing results from one handler to the other", function (done) {
                new PromiseClass(function (resolve/*, reject*/) {
                    resolve("ok 1");
                })
                    .then(function (value) {
                        assert("ok 1" === value);
                        return "ok 2";
                    })
                    .then(function (value) {
                        assert("ok 2" === value);
                        return "ok 3";
                    })
                    .then(function (value) {
                        assert("ok 3" === value);
                        return "ok 4";
                    })
                    .then(function (value) {
                        assert("ok 4" === value);
                        done();
                    });
            });

            it("chains by returning a promise in the fulfilment handler", function (done) {
                new PromiseClass(function (resolve/*, reject*/) {
                    resolve("ok 1");
                })
                    .then(function (value) {
                        assert("ok 1" === value);
                        return PromiseClass.resolve("ok 2");
                    })
                    .then(function (value) {
                        assert("ok 2" === value);
                        return new PromiseClass(function (resolve/*, reject*/) {
                            setTimeout(function () {
                                resolve("ok 3");
                            });
                        });
                    })
                    .then(function (value) {
                        assert("ok 3" === value);
                        done();
                    });
            });

            it("stops on first error", function (done) {

                new PromiseClass(function (resolve/*, reject*/) {
                    resolve("ok 1");
                })
                    .then(function (value) {
                        assert("ok 1" === value);
                        return "ok 2";
                    })
                    .then(function (value) {
                        assert("ok 2" === value);
                        throw new Error("ko");
                    })
                    .then(function (/*value*/) {
                        assert(false);
                    })["catch"](function (reason) {
                        assert(reason instanceof Error);
                        assert("ko" === reason.message);
                        done();
                    });

            });

        });

        describe("synchronisation", function () {

            describe("Promise.all", function () {

                it("waits for all promises to be resolved", function (done) {
                    var promises = [],
                        index;
                    for (index = 0; index < 10; ++index) {
                        promises.push(PromiseClass.resolve(index));
                    }
                    PromiseClass.all(promises)
                        .then(function (values) {
                            assert(45 === values.reduce(function (previousValue, currentValue) {
                                return previousValue + currentValue;
                            }));
                            done();
                        });
                });

                it("fails on the first error", function (done) {
                    var promises = [],
                        index;
                    function resolveOrReject(value) {
                        if (0 === value % 2) {
                            return PromiseClass.reject(value);
                        } else {
                            return PromiseClass.resolve(value);
                        }
                    }
                    for (index = 0; index < 10; ++index) {
                        promises.push(resolveOrReject(index));
                    }
                    PromiseClass.all(promises)
                        .then(function (/*values*/) {
                            assert(false);
                        })["catch"](function (reason) {
                            assert("number" === typeof reason);
                            assert(reason < 10);
                            done();
                        });
                });

            });

            describe("Promise.race", function () {

                it("waits for the first promise that is resolved", function (done) {
                    var promises = [],
                        index;
                    function resolveAfter(value) {
                        return new PromiseClass(function (resolve/*, reject*/) {
                            setTimeout(function () {
                                resolve(value);
                            }, (10-value) * 10); // Last should be the first to be executed
                        });
                    }
                    for (index = 0; index < 10; ++index) {
                        promises.push(resolveAfter(index));
                    }
                    PromiseClass.race(promises)
                        .then(function (value) {
                            assert(value === 9);
                            done();
                        });
                });

                it("waits for the first promise that is resolved or rejected", function (done) {
                    var promises = [],
                        index;
                        function resolveOrRejectAfter(value) {
                            return new PromiseClass(function (resolve, reject) {
                                if (5 === value) {
                                    return new PromiseClass(function (resolve, reject) {
                                        setTimeout(function () {
                                            reject(value);
                                        }, 10);
                                    });
                                } else {
                                    return new PromiseClass(function (resolve/*, reject*/) {
                                        setTimeout(function () {
                                            resolve(value);
                                        }, 20);
                                    });
                                }
                            });
                        }
                    for (index = 0; index < 10; ++index) {
                        promises.push(resolveOrRejectAfter(index));
                    }
                    PromiseClass.race(promises)
                        .then(function (/*values*/) {
                            assert(false);
                        })["catch"](function (reason) {
                            assert("number" === typeof reason);
                            assert(5 === reason);
                            done();
                        });
                });

            });

        });

    }

    describe("Promise", function () {

        generateTests(Promise);

    });

    if (gpf.internals && Promise !== gpf.internals._GpfPromise) {

        describe("(internal) _GpfPromise", function () {

            generateTests(gpf.internals._GpfPromise);

        });

    }

});

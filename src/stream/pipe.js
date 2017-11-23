/**
 * @file Stream piping
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfStreamQueryReadable*/ // Get an IReadableStream or fail if not implemented
/*global _gpfStreamQueryWritable*/ // Get an IWritableStream or fail if not implemented
/*exported _gpfStreamPipe*/ // gpf.stream.pipe
/*#endif*/

/**
 * Pipe streams.
 *
 * @param {gpf.interfaces.IReadableStream} source Source stream
 * @param {...gpf.interfaces.IWritableStream} destination Writable streams
 * @return {Promise} Resolved when reading (and subsequent writings) are done
 */
function _gpfStreamPipe (source, destination) {
    var iReadableStream = _gpfStreamQueryReadable(source),
        iWritableStream = _gpfStreamQueryWritable(destination);
    return iReadableStream .read(iWritableStream);
}

/** @gpf:sameas _gpfStreamPipe */
gpf.stream.pipe = _gpfStreamPipe;

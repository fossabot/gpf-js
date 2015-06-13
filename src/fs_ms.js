/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_READY*/ // gpf.events.EVENT_READY
/*global _GPF_FS_TYPE_DIRECTORY*/ // _GPF_FS_TYPE_DIRECTORY
/*global _GPF_FS_TYPE_FILE*/ // _GPF_FS_TYPE_FILE
/*global _GPF_FS_TYPE_NOT_FOUND*/ // _GPF_FS_TYPE_NOT_FOUND
/*global _gpfArrayEnumerator*/ // Create an IEnumerator from an array
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfInNode*/ // The current host is a nodeJS like
/*global _gpfMsFSO:true*/ // Scripting.FileSystemObject activeX
/*global _gpfPathNormalize*/ // Normalize path
// /*#endif*/

var
    /**
     * @type {gpf.fs.WScriptFileStorage}
     * @private
     */
    _gpfWScriptFileStorage,

    /**
     * Translate WScript object info into a file info
     *
     * @param {Scripting.FileSystemObject.File
     * |Scripting.FileSystemObject.Folder} fsoObj
     * @param {Number} type
     * @private
     */
    _gpfFsoObjToInfo = function (fsoObj, type) {
        return {
            type: type,
            fileName: _gpfPathNormalize(fsoObj.Name),
            filePath: _gpfPathNormalize(fsoObj.Path),
            size: fsoObj.Size,
            createdDateTime: fsoObj.DateCreated,
            modifiedDateTime: fsoObj.DateLastModified
        };
    };

_gpfDefine("gpf.fs.WScriptFileStorage", {

    public: {

        constructor: function () {
            if (!_gpfMsFSO) {
                _gpfMsFSO = new ActiveXObject("Scripting.FileSystemObject");
            }
        },

        //region IFileStorage

        /**
         * @inheritdoc IFileStorage#getInfo
         */
        getInfo: function (path, eventsHandler) {
            if (_gpfMsFSO.FileExists(path)) {
                var file = _gpfMsFSO.GetFile(path);
                _gpfEventsFire.apply(null, [
                    _GPF_EVENT_READY,
                    {
                        info: _gpfFsoObjToInfo(file, _GPF_FS_TYPE_FILE)
                    },
                    eventsHandler
                ]);

            } else if (_gpfMsFSO.FolderExists(path)) {
                var folder = _gpfMsFSO.GetFolder(path);
                _gpfEventsFire.apply(null, [
                    _GPF_EVENT_READY,
                    {
                        info: _gpfFsoObjToInfo(folder, _GPF_FS_TYPE_DIRECTORY)
                    },
                    eventsHandler
                ]);

            } else {
                _gpfEventsFire.apply(null, [
                    _GPF_EVENT_READY,
                    {
                        info: {
                            type: _GPF_FS_TYPE_NOT_FOUND
                        }
                    },
                    eventsHandler
                ]);
            }
        },

        /**
         * @inheritdoc IFileStorage#readAsBinaryStream
         */
        readAsBinaryStream: function (path, eventsHandler) {
            /* Use text stream reading as Unicode and returns a byte array */
            // var textStream = _gpfMsFSO.OpenTextFile(path, 1,false, -1);
            // Requires IReadableStream
            _gpfIgnore(path);
            _gpfIgnore(eventsHandler);
            throw gpf.Error.NotImplemented();
        },

        /**
         * @inheritdoc IFileStorage#writeAsBinaryStream
         */
        writeAsBinaryStream: function (path, eventsHandler) {
            _gpfIgnore(path);
            _gpfIgnore(eventsHandler);
            throw gpf.Error.NotImplemented();
        },

        /**
         * @inheritdoc IFileStorage#close
         */
        close: function (stream) {
            _gpfIgnore(stream);
            // TODO not sure what I should do with it...
        },

        /**
         * @inheritdoc IFileStorage#explore
         */
        explore: function (path, eventsHandler) {
            var result = [],
                folder,
                fsoEnum;
            if (_gpfMsFSO.FolderExists(path)) {
                folder = _gpfMsFSO.GetFolder(path);
                // files
                fsoEnum = new Enumerator(folder.Files);
                for(; fsoEnum.atEnd(); fsoEnum.moveNext()) {
                    result.push(_gpfFsoObjToInfo(fsoEnum.item(),
                        _GPF_FS_TYPE_FILE));
                }
                // folders
                fsoEnum = new Enumerator(folder.SubFolders);
                for(; fsoEnum.atEnd(); fsoEnum.moveNext()) {
                    result.push(_gpfFsoObjToInfo(fsoEnum.item(),
                        _GPF_FS_TYPE_DIRECTORY));
                }
            }
            _gpfEventsFire.apply(null, [
                _GPF_EVENT_READY,
                {
                    enumerator: _gpfArrayEnumerator(result)
                },
                eventsHandler
            ]);
        }

        //endregion

    }

});

if (_gpfInNode) {

    /**
     * @inheritdoc gpf.fs#host
     * WScript version
     */
    gpf.fs.host = function () {
        if (!_gpfWScriptFileStorage) {
            _gpfWScriptFileStorage = new gpf.fs.WScriptFileStorage();
        }
        return _gpfWScriptFileStorage;
    };

}

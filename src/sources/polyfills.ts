// >:(
import * as buffer from "buffer";
(window as any).Buffer = buffer.Buffer;

// For all the global PB libraries

// 0.6
import "paperback-extensions-common/lib/_impl";

// 0.8+
import "@paperback/types"
import "@paperback/runtime-polyfills";
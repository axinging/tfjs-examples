function sleep(timeMs) {
  return new Promise(resolve => setTimeout(resolve, timeMs));
}

export async function logKernelTime(kernels) {
  await sleep(10);
  console.info("logKernelTime start: "+kernels.length);
  let i = 0;
  console.clear();
  kernels.forEach(k => {
    i = i + 1;
    oldLog.call(oldLog, i+'  '+
        k.scopes[k.scopes.length - 1] + '  ' + k.time.toFixed(2) + '  ' +
        k.output + '  ' + k.gpuProgramsInfo);
  });
  console.info("logKernelTime end: "+kernels.length);
}

let oldLog;
export function startLog(kernels) {
  ENV.set('DEBUG', true);
  oldLog = console.log;
  console.log = msg => {
    let parts = [];
    if (typeof msg === 'string') {
      parts = msg.split('\t').map(x => x.slice(2));
    }

    if (parts.length > 2) {
      // heuristic for determining whether we've caught a profiler
      // log statement as opposed to a regular console.log
      // TODO(https://github.com/tensorflow/tfjs/issues/563): return timing
      // information as part of tf.profile
      const scopes =
          parts[0].trim().split('||').filter(s => s !== 'unnamed scope');
      
      kernels.push({
        scopes: scopes,
        time: Number.parseFloat(parts[1]),
        output: parts[2].trim(),
        gpuProgramsInfo: parts[4]
      });
    } else {
      oldLog.call(oldLog, msg);
    }
  }
}

// TODO(xing.xu): This endLog can not work under async mdoe.
async function endLog(kernels) {
  ENV.set('DEBUG', false);
  console.log = oldLog;
  console.log("DEBUGMODE"+ENV.get('DEBUG'));
  logKernelTime(kernels);
}
// TODO(xing.xu): work out a better method to switch back to oldlog.
// TODO(xing.xu): add log seperator between different predict.

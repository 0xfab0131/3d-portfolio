import { useEffect, useRef, useCallback } from 'react'

/**
 * Web Worker を使用して計算処理をメインスレッドから分離するカスタムフック
 * 3D計算やアニメーション補間などの重い処理をバックグラウンドで実行
 * @param {Function} workerFunction - Web Worker内で実行する関数
 * @param {Object} options - 設定オプション
 * @param {boolean} options.enabled - Workerを有効にするかどうか
 * @returns {Object} Workerとの通信メソッド
 */
export const useWorkerizedComputation = (workerFunction, { enabled = true } = {}) => {
  const workerRef = useRef(null)
  const callbacksRef = useRef({})

  // Workerの作成
  useEffect(() => {
    if (!enabled) return

    // Worker作成
    const workerCode = `
      // Worker内部で実行する関数
      const workerFunction = ${workerFunction.toString()};
      
      // メインスレッドからのメッセージ受信ハンドラ
      self.onmessage = function(e) {
        const { id, action, payload } = e.data;
        
        // 処理の種類に応じて関数を実行
        if (action === 'compute') {
          try {
            const result = workerFunction(payload);
            self.postMessage({ id, result, error: null });
          } catch (error) {
            self.postMessage({ id, result: null, error: error.message });
          }
        }
      };
    `

    // Worker BlobとURLの作成
    const blob = new Blob([workerCode], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)

    // Workerのインスタンス化
    workerRef.current = new Worker(url)

    // Workerからの結果受信ハンドラ
    workerRef.current.onmessage = (e) => {
      const { id, result, error } = e.data

      // 対応するコールバックが登録されていれば実行
      if (callbacksRef.current[id]) {
        if (error) {
          callbacksRef.current[id].reject(new Error(error))
        } else {
          callbacksRef.current[id].resolve(result)
        }

        // 使用済みコールバックの削除
        delete callbacksRef.current[id]
      }
    }

    // エラーハンドラ
    workerRef.current.onerror = (error) => {
      console.error('Worker error:', error)
    }

    // クリーンアップ関数
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        URL.revokeObjectURL(url)
      }
    }
  }, [workerFunction, enabled])

  // Workerに計算を依頼する関数
  const compute = useCallback(
    (payload) => {
      if (!enabled || !workerRef.current) {
        // Workerが無効な場合はメインスレッドで実行
        try {
          return Promise.resolve(workerFunction(payload))
        } catch (error) {
          return Promise.reject(error)
        }
      }

      // Workerに計算を依頼
      return new Promise((resolve, reject) => {
        const id = Math.random().toString(36).substring(2, 9)

        // コールバックの登録
        callbacksRef.current[id] = { resolve, reject }

        // Workerへメッセージ送信
        workerRef.current.postMessage({
          id,
          action: 'compute',
          payload
        })
      })
    },
    [workerFunction, enabled]
  )

  // Workerの状態を確認
  const isAvailable = useCallback(() => {
    return enabled && workerRef.current !== null
  }, [enabled])

  return {
    compute,
    isAvailable
  }
}

/**
 * 3D計算用のプリセット関数（Workerで使用）
 * 頂点計算やマトリックス演算など重い処理を行う
 */
export const predefinedWorkerFunctions = {
  // 頂点変形計算
  computeVertexTransform: `function(data) {
    const { vertices, transformMatrix, count } = data;
    const result = new Float32Array(count * 3);
    
    // 行列演算ライブラリの代わりに簡易的な実装
    function applyMatrix4(out, x, y, z, m) {
      const w = 1 / (m[3] * x + m[7] * y + m[11] * z + m[15]);
      out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) * w;
      out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) * w;
      out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) * w;
      return out;
    }
    
    // 全頂点を変換
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      applyMatrix4(
        [result[idx], result[idx + 1], result[idx + 2]],
        vertices[idx],
        vertices[idx + 1],
        vertices[idx + 2],
        transformMatrix
      );
    }
    
    return result;
  }`,

  // アニメーションデータの補間計算
  computeInterpolation: `function(data) {
    const { keyframes, currentTime, duration, easing } = data;
    
    // 簡易的なイージング関数
    const easingFunctions = {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    };
    
    const easeFn = easingFunctions[easing] || easingFunctions.linear;
    const normalizedTime = (currentTime % duration) / duration;
    const easedTime = easeFn(normalizedTime);
    
    // キーフレーム間の補間を計算
    let prevFrame = keyframes[0];
    let nextFrame = keyframes[keyframes.length - 1];
    
    for (let i = 0; i < keyframes.length; i++) {
      if (keyframes[i].time <= normalizedTime && (!prevFrame || keyframes[i].time > prevFrame.time)) {
        prevFrame = keyframes[i];
      }
      if (keyframes[i].time >= normalizedTime && (!nextFrame || keyframes[i].time < nextFrame.time)) {
        nextFrame = keyframes[i];
      }
    }
    
    // 補間係数の計算
    const frameDuration = nextFrame.time - prevFrame.time;
    const frameProgress = frameDuration <= 0 ? 0 : (normalizedTime - prevFrame.time) / frameDuration;
    const t = easeFn(frameProgress);
    
    // 結果データの補間
    const result = {};
    for (const key in prevFrame.values) {
      if (typeof prevFrame.values[key] === 'number' && typeof nextFrame.values[key] === 'number') {
        result[key] = prevFrame.values[key] + (nextFrame.values[key] - prevFrame.values[key]) * t;
      } else {
        result[key] = t < 0.5 ? prevFrame.values[key] : nextFrame.values[key];
      }
    }
    
    return result;
  }`
}

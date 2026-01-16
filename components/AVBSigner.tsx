'use client';

import { useState, useRef, useEffect } from 'react';
import { loadPyodide } from 'pyodide';
import type { PyodideInterface } from 'pyodide';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

export default function AVBSigner() {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [partitionSize, setPartitionSize] = useState<string>('100663296');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化 Pyodide
  useEffect(() => {
    const initPyodide = async () => {
      try {
        addLog('info', '正在初始化 Pyodide 环境...');
        setLoadingProgress(10);

        // 动态加载 Pyodide
        const pyodideInstance = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        });

        setLoadingProgress(40);
        addLog('info', '正在加载 Python 依赖包...');

        // 安装必要的 Python 包
        await pyodideInstance.loadPackage(['micropip']);
        const micropip = pyodideInstance.pyimport('micropip');
        
        setLoadingProgress(60);
        addLog('info', '正在安装加密库...');
        try {
          await micropip.install(['pycryptodome']);
        } catch (e) {
          addLog('warning', '某些加密库可能已安装或不可用，继续执行...');
        }

        setLoadingProgress(75);
        addLog('info', '正在加载 AVB 签名脚本...');

        // 加载 AVB 工具脚本和密钥
        await loadAVBScript(pyodideInstance);

        setLoadingProgress(100);
        setPyodide(pyodideInstance);
        setIsLoading(false);
        addLog('success', 'Pyodide 环境初始化完成！');
      } catch (error) {
        console.error('Pyodide 初始化失败:', error);
        addLog('error', `初始化失败: ${error instanceof Error ? error.message : String(error)}`);
        setIsLoading(false);
      }
    };

    initPyodide();
  }, []);

  // 加载 AVB 脚本和密钥
  const loadAVBScript = async (pyodideInstance: PyodideInterface) => {
    try {
      // 加载 AVB 工具脚本
      const avbScript = await fetch('/scripts/avbtool.py').then((r) => r.text());
      pyodideInstance.runPython(avbScript);
      
      // 加载 testkey.pem（使用 base64 编码的密钥内容）
      // 由于 .pem 文件可能被 gitignore，我们将其作为内嵌字符串
      const testkeyPem = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAyZMLQ6E2FrNm6LvG/1XcXNKm7yF0Z7QqJkJQYJQD7p7XQf5Z
xN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p
7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJ
QYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3
qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7X
Qf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQY
JQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ
8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf
5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQ
D7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8
KQmJQYJQD7p7XQf5ZxN3qQ8KQmJQYJQD7p7XQf5ZxN3qQ8KQwIDAQABAoIB
-----END RSA PRIVATE KEY-----`;
      
      pyodideInstance.FS.writeFile('/tmp/testkey.pem', testkeyPem);
      addLog('info', '密钥文件已加载');
    } catch (error) {
      console.error('加载 AVB 脚本失败:', error);
      addLog('error', `加载脚本失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const addLog = (level: LogEntry['level'], message: string) => {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString('zh-CN'),
      level,
      message,
    };
    setLogs((prev) => [...prev, entry]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.img')) {
        setSelectedFile(file);
        addLog('success', `已选择文件: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        addLog('error', '请选择 .img 文件');
      }
    }
  };

  const handleSign = async () => {
    if (!pyodide || !selectedFile) {
      addLog('error', '请先选择 boot.img 文件');
      return;
    }

    setIsProcessing(true);
    addLog('info', '开始处理 boot.img 文件...');

    try {
      // 读取文件为 ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      addLog('info', `文件大小: ${uint8Array.length} 字节`);
      addLog('info', `分区大小: ${partitionSize} 字节`);

      // 将文件数据传递给 Python
      pyodide.FS.writeFile('/tmp/boot.img', uint8Array, { encoding: 'binary' });

      addLog('info', '正在执行 AVB 签名...');

      // 执行签名操作
      const partitionSizeNum = parseInt(partitionSize, 10);
      
      // 使用 runPythonAsync 来避免阻塞
      const result = await pyodide.runPythonAsync(`
import sys
sys.path.insert(0, '/tmp')

try:
    from avbtool import add_hash_footer
    
    add_hash_footer(
        image_filename='/tmp/boot.img',
        partition_size=${partitionSizeNum},
        key_path='/tmp/testkey.pem',
        algorithm='SHA256_RSA4096',
        output_filename='/tmp/boot_signed.img'
    )
    "success"
except Exception as e:
    import traceback
    error_msg = f"error: {str(e)}\\n{traceback.format_exc()}"
    error_msg
      `);

      if (result === 'success') {
        // 读取签名后的文件
        const signedData = pyodide.FS.readFile('/tmp/boot_signed.img', { encoding: 'binary' });
        const signedBlob = new Blob([signedData], { type: 'application/octet-stream' });

        // 创建下载链接
        const url = URL.createObjectURL(signedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name.replace('.img', '_signed.img');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addLog('success', 'AVB 签名完成！文件已准备好下载。');
      } else {
        addLog('error', `签名失败: ${result}`);
      }
    } catch (error) {
      console.error('签名过程出错:', error);
      addLog('error', `处理失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
      {/* 加载状态 */}
      {isLoading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">初始化中...</span>
            <span className="text-white/70 text-sm">{loadingProgress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 文件选择区域 */}
      <div className="mb-6">
        <label className="block text-white font-medium mb-2">选择 boot.img 文件</label>
        <div className="flex gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".img"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isProcessing}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            选择文件
          </button>
          {selectedFile && (
            <div className="flex-1 px-4 py-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white text-sm">{selectedFile.name}</p>
              <p className="text-white/60 text-xs">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 分区大小设置 */}
      <div className="mb-6">
        <label className="block text-white font-medium mb-2">
          分区大小（字节）
        </label>
        <input
          type="number"
          value={partitionSize}
          onChange={(e) => setPartitionSize(e.target.value)}
          disabled={isLoading || isProcessing}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="100663296"
        />
        <p className="text-white/60 text-xs mt-1">
          默认值 100663296 适用于 Y700 四代平板
        </p>
      </div>

      {/* 签名按钮 */}
      <button
        onClick={handleSign}
        disabled={isLoading || isProcessing || !selectedFile}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:transform-none mb-6"
      >
        {isProcessing ? '正在处理...' : '执行 AVB 签名'}
      </button>

      {/* 日志区域 */}
      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">状态日志</h3>
          <button
            onClick={() => setLogs([])}
            className="text-white/60 hover:text-white text-sm"
          >
            清空
          </button>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-white/40">暂无日志</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  log.level === 'error'
                    ? 'bg-red-500/20 text-red-300'
                    : log.level === 'success'
                    ? 'bg-green-500/20 text-green-300'
                    : log.level === 'warning'
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-blue-500/20 text-blue-300'
                }`}
              >
                <span className="opacity-60">[{log.timestamp}]</span>{' '}
                <span className="uppercase font-bold">{log.level}:</span>{' '}
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
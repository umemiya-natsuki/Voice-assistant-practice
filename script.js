// JavaScript Document// HTML要素の取得
const statusEl = document.getElementById('status');
const recognizedTextEl = document.getElementById('recognized-text');
const assistantReplyEl = document.getElementById('assistant-reply');
const actionResultEl = document.getElementById('action-result');
const startBtn = document.getElementById('start-btn');

// 状態管理フラグ（false: 「もしもし」待ち / true: 「こんにちは」待ち）
let isWaitingForCommand = false;
let isRunning = false;

// 音声認識の初期化
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.continuous = true;      // 継続的に認識する
  recognition.interimResults = false; // 確定した結果のみ受け取る

  // 音声を認識したときの処理
  recognition.onresult = (event) => {
    const lastIndex = event.results.length - 1;
    const transcript = event.results[lastIndex][0].transcript.trim();
    handleSpeechInput(transcript);
  };

  // 認識が途切れたら自動で再開する
  recognition.onend = () => {
    if (isRunning) {
      recognition.start();
    }
  };
}

// 起動ボタンの処理
startBtn.addEventListener('click', () => {
  if (!recognition) {
    alert('お使いのブラウザは音声認識に対応していません。Chrome等をお使いください。');
    return;
  }
  isRunning = true;
  recognition.start();
  startBtn.disabled = true;
  startBtn.textContent = '起動中...';
  updateStatus('「もしもし」と呼んでください', 'listening');
});

// テストボタンの処理
document.getElementById('test-wake-btn').addEventListener('click', () => {
  handleSpeechInput('もしもし');
});
document.getElementById('test-cmd-btn').addEventListener('click', () => {
  handleSpeechInput('こんにちは');
});

// 認識したテキストを判定するメイン処理
function handleSpeechInput(text) {
  recognizedTextEl.textContent = text;

  // 1. 「もしもし」待ちの状態
  if (!isWaitingForCommand) {
    if (text.includes('もしもし')) {
      isWaitingForCommand = true;
      actionResultEl.classList.add('hidden');
      updateStatus('はい、ご用件は？（「こんにちは」と言ってください）', 'active');

      // 「もしもし、こんにちは」と一息で言われた場合の対応
      if (text.includes('こんにちは')) {
        executeGreetingProgram();
      }
    }
  } 
  // 2. 「こんにちは」待ちの状態
  else {
    if (text.includes('こんにちは')) {
      executeGreetingProgram();
    }
  }
}

// 「こんにちは」と言われたときに実行するプログラム
function executeGreetingProgram() {
  const replyMessage = 'こんにちは、元気ですか。';

  // 画面への表示
  assistantReplyEl.textContent = replyMessage;
  actionResultEl.classList.remove('hidden');

  // 音声での返答
  speak(replyMessage);

  // 状態を最初の「もしもし」待ちに戻す
  isWaitingForCommand = false;
  updateStatus('「もしもし」と呼んでください', 'listening');
}

// 音声合成（テキストを読み上げる）
function speak(text) {
  window.speechSynthesis.cancel(); // 前の発話をキャンセル
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  window.speechSynthesis.speak(utterance);
}

// ステータス表示の更新
function updateStatus(message, className) {
  statusEl.textContent = message;
  statusEl.className = 'status ' + className;
}
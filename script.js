const video        = document.getElementById('video');
const canvas       = document.getElementById('canvas');
const ctx          = canvas.getContext('2d');
const statusCamera = document.getElementById('statusCamera');
const inputNome    = document.getElementById('nomeAluno');

const btnLigar     = document.getElementById('btnLigar');
const btnCapturar  = document.getElementById('btnCapturar');
const btnDesligar  = document.getElementById('btnDesligar');

let stream = null;

async function ligarCamera() {
    if (stream) return;

    statusCamera.textContent = 'Solicitando acesso à câmera...';
    statusCamera.classList.remove('erro');

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' },
            audio: false
        });

        video.srcObject = stream;
        video.classList.remove('off');

        await video.play().catch(() => {});

        statusCamera.textContent = '';
        btnLigar.disabled    = true;
        btnCapturar.disabled = false;
        btnDesligar.disabled = false;

    } catch (erro) {
        tratarErroCamera(erro);
    }
}

function desligarCamera() {
    if (!stream) return;

    stream.getTracks().forEach(track => track.stop());

    stream = null;
    video.srcObject = null;
    video.classList.add('off');

    statusCamera.textContent = 'Câmera desligada. Clique em "Ligar Câmera" para reiniciar.';
    statusCamera.classList.remove('erro');

    btnLigar.disabled    = false;
    btnCapturar.disabled = true;
    btnDesligar.disabled = true;
}

function tratarErroCamera(erro) {
    console.error('Erro na câmera:', erro);

    let mensagem = 'Não foi possível acessar a câmera.';

    switch (erro.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
            mensagem = '🚫 Permissão negada. Autorize o acesso à câmera no navegador e tente novamente.';
            break;
        case 'NotFoundError':
        case 'DevicesNotFoundError':
            mensagem = '📵 Nenhuma câmera foi encontrada neste dispositivo.';
            break;
        case 'NotReadableError':
            mensagem = '⚠️ A câmera está em uso por outro aplicativo.';
            break;
        case 'OverconstrainedError':
            mensagem = '⚙️ A câmera não suporta as configurações solicitadas.';
            break;
        case 'SecurityError':
            mensagem = '🔒 Acesso bloqueado por segurança (use HTTPS ou localhost).';
            break;
    }

    statusCamera.textContent = mensagem;
    statusCamera.classList.add('erro');

    btnLigar.disabled    = false;
    btnCapturar.disabled = true;
    btnDesligar.disabled = true;
}

function capturarFoto() {
    if (!stream || video.readyState < 2) {
        statusCamera.textContent = '⚠️ Ligue a câmera antes de capturar.';
        statusCamera.classList.add('erro');
        return;
    }

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.filter = 'sepia(1) contrast(1.1)';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    ctx.filter = 'none';

    const nome  = (inputNome.value.trim() || 'Anônimo').slice(0, 40);
    const agora = new Date();
    const dataHora = agora.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    desenharIdentificacao(nome, dataHora);
}

function desenharIdentificacao(nome, dataHora) {
    const largura = canvas.width;
    const altura  = canvas.height;

    const faixaAltura = Math.max(70, altura * 0.16);
    const yFaixa = altura - faixaAltura;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, yFaixa, largura, faixaAltura);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, yFaixa, largura, 4);

    const fontSize = Math.max(18, Math.round(largura * 0.045));
    ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(nome, 20, yFaixa + faixaAltura * 0.35);

    const fontSizeData = Math.max(14, Math.round(largura * 0.032));
    ctx.font = `${fontSizeData}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(`🕒 ${dataHora}`, 20, yFaixa + faixaAltura * 0.72);
}

btnLigar.addEventListener('click', ligarCamera);
btnCapturar.addEventListener('click', capturarFoto);
btnDesligar.addEventListener('click', desligarCamera);

window.addEventListener('beforeunload', () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
});

statusCamera.textContent = 'Clique em "Ligar Câmera" para começar.';
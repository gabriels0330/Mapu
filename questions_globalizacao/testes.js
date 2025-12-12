document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.cards');
    const nextButton = document.getElementById('next');
    const explain = document.getElementById('resolution');
    const sideBottom = document.getElementsByClassName('check');
    const check_circle_content = document.getElementById('check_circle_content');
    const audioCorrect = document.getElementById('audioCorrect');
    const audioIncorrect = document.getElementById('audioIncorrect');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const jumpButton = document.getElementById('jump_button');

    let jumpedQuestions = JSON.parse(localStorage.getItem('jumpedQuestions')) || [];
    let selectedCard = null;
    let questionChecked = false;
    let nextCount = 0;
    const TOTAL_QUESTIONS = 10;
    
    // Função para atualizar a progress bar
    function updateProgressBar() {
        // Calcula a porcentagem baseada no número de questões respondidas
        const percentage = (totalAnswered / TOTAL_QUESTIONS) * 100;
        
        // Atualiza a largura da barra de progresso
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        // Atualiza o texto
        if (progressText) {
            progressText.textContent = `${totalAnswered}/${TOTAL_QUESTIONS}`;
        }
        
        // Muda a cor gradativamente
        if (progressFill) {
            if (percentage <= 30) {
                progressFill.style.background = 'linear-gradient(90deg, #FF5722, #FF9800)';
            } else if (percentage <= 70) {
                progressFill.style.background = 'linear-gradient(90deg, #FF9800, #FFEB3B)';
            } else {
                progressFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
            }
        }
    }

    // Função para obter o nome do arquivo da URL atual
    const getFileNameFromUrl = () => {
        const url = window.location.pathname;
        return url.substring(url.lastIndexOf('/') + 1);
    };

    // Função para zerar os contadores
    const resetCounters = () => {
        localStorage.removeItem('correctCount');
        localStorage.removeItem('totalAnswered');
        localStorage.removeItem('currentQuestionNumber');
        document.getElementById('correctCount').textContent = 0;
        document.getElementById('totalAnswered').textContent = 0;
        if (progressText) {
            progressText.textContent = '0/10';
        }
        if (progressFill) {
            progressFill.style.width = '0%';
        }
    };

    // Verifica se o nome do arquivo é 'globalizacao_q_1.html'
    if (getFileNameFromUrl() === 'globalizacao_q_1.html') {
        // Zera os contadores se o nome do arquivo corresponde
        resetCounters();
    }

    // Verifica se a página foi recarregada
    if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
        // Se a página foi recarregada, zera os contadores e redireciona para a primeira página
        if (getFileNameFromUrl() === 'globalizacao_q_1.html') {
            resetCounters();
        }
        window.location.href = 'globalizacao_q_1.html';
    }

    // Recupera os valores de acertos e perguntas respondidas do localStorage ou inicia com 0
    let correctCount = parseInt(localStorage.getItem('correctCount')) || 0;
    let totalAnswered = parseInt(localStorage.getItem('totalAnswered')) || 0;
    
    // Recupera o número da questão atual ou inicia com 1
    let questionNumber = parseInt(localStorage.getItem('currentQuestionNumber')) || 1;

    // Obtém o número da questão dessa página
    const currentPageQuestionNumber = parseInt(document.body.getAttribute('data-question-number')) || 1;

    // Se o número da questão armazenado for menor que o número da questão atual, atualize o localStorage
    if (questionNumber < currentPageQuestionNumber) {
        questionNumber = currentPageQuestionNumber;
        localStorage.setItem('currentQuestionNumber', questionNumber);
    }

    // Atualiza os elementos de contagem com os valores recuperados
    const correctCountElement = document.getElementById('correctCount');
    const totalAnsweredElement = document.getElementById('totalAnswered');
    correctCountElement.textContent = correctCount;
    totalAnsweredElement.textContent = totalAnswered;
    
    // Atualiza a progress bar inicialmente
    updateProgressBar();

    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (questionChecked) return; // Não permite alterar a seleção após a conferência
            
            if (selectedCard) {
                selectedCard.classList.remove('selected');
            }
            card.classList.add('selected');
            selectedCard = card;
            nextButton.disabled = false;
            nextButton.classList.add('enabled');
            nextButton.style.backgroundColor = 'rgb(51, 167, 51)';
            nextButton.style.borderBottom = '5px solid rgb(0, 51, 0)';
            nextButton.style.cursor = 'pointer';
        });
    });

    nextButton.addEventListener('click', () => {
        // Se não há carta selecionada, ignora (fluxo normal antes de confirmar)
        if (!selectedCard) return;

        // ---------- 1º clique: conferir resposta ----------
        if (nextCount === 0) {
            nextCount = 1;

            if (!questionChecked) {
                questionChecked = true; // Marca a pergunta como conferida

                // Incrementa o contador de questões respondidas
                totalAnswered++;
                totalAnsweredElement.textContent = totalAnswered;
                localStorage.setItem('totalAnswered', totalAnswered);
                
                // Atualiza a progress bar
                updateProgressBar();

                explain.style.display = "block";
                const jump_button = document.getElementById('jump_button');
                if (jump_button) {
                    jump_button.style.display = "none";
                }
                const isCorrect = selectedCard.getAttribute('data-answer') === 'correct';
                if (isCorrect) {
                    selectedCard.classList.add('correct');
                    // Incrementa o contador de acertos
                    correctCount++;
                    correctCountElement.textContent = correctCount;
                    localStorage.setItem('correctCount', correctCount);

                    nextButton.style.backgroundColor = 'rgb(51, 167, 51)';
                    nextButton.style.borderBottom = '5px solid rgb(0, 51, 0)';

                    // Adiciona a bola ao container
                    check_circle_content.innerHTML = `
                        <div class="bola">
                            <div class="checked">✓</div>
                        </div>
                    `;
                    // Toca o áudio correto
                    if (audioCorrect) {
                        audioCorrect.play();
                    }
                } else {
                    selectedCard.classList.add('incorrect');
                    nextButton.style.backgroundColor = 'red';
                    nextButton.style.borderBottom = '5px solid rgb(164, 3, 3)';

                    // Adiciona o X ao container
                    check_circle_content.innerHTML = `
                        <div class="erro">
                            <div class="error-mark">✗</div>
                        </div>
                    `;
                    // Toca o áudio incorreto
                    if (audioIncorrect) {
                        audioIncorrect.play();
                    }
                }

                cards.forEach(card => {
                    if (card !== selectedCard) {
                        if (card.getAttribute('data-answer') === 'correct') {
                            card.classList.add('correct');
                        } else {
                            card.classList.add('incorrect');
                        }
                    }
                    card.style.pointerEvents = 'none';
                });

                // Adiciona a classe 'correct' ou 'incorrect' ao elemento .check
                Array.from(sideBottom).forEach(check => {
                    check.classList.add(isCorrect ? 'correct' : 'incorrect');
                });

                nextButton.textContent = 'PRÓXIMO';
            }

            // Bloqueio curto para evitar clique involuntário imediato (usuário segurando o botão/ENTER)
            nextButton.disabled = true;
            nextButton.blur(); // remove foco para evitar ENTER disparando novamente
            setTimeout(() => {
                nextButton.disabled = false;
            }, 350); // 350ms é um tempo seguro; ajuste se quiser

            return;
        }

        // ---------- 2º clique: avançar ----------
        if (nextCount === 1) {
            nextCount = 2;

            // Atualiza o total de questões para 10
            if (totalAnswered >= TOTAL_QUESTIONS) {
                // Todas as perguntas foram respondidas, redireciona para a página apropriada
                if (correctCount <= 5) {
                    window.location.href = 'tentativa.html';
                } else if (correctCount <= 10) {
                    window.location.href = 'bronze.html';
                } else if (correctCount <= 14) {
                    window.location.href = 'prata.html';
                } else if (correctCount == TOTAL_QUESTIONS) {
                    window.location.href = 'ouro.html';
                }
            } else {
                // Incrementa o número da questão
                questionNumber++;
                localStorage.setItem('currentQuestionNumber', questionNumber);

                // Adiciona o número da questão no histórico
                history.pushState({ questionNumber }, '', `globalizacao_q_${questionNumber}.html`);

                // Redireciona para a próxima página
                window.location.href = `globalizacao_q_${questionNumber}.html`;
            }

            return;
        }

        // Qualquer clique extra (nextCount > 1) será ignorado
        return;
    });

    // Manipulador para eventos de navegação
    window.addEventListener('popstate', (event) => {
        // Pergunta de confirmação ao voltar para uma página anterior
        const userConfirmed = window.confirm("Você tem certeza de que deseja sair do jogo? Seu progresso pode ser perdido.");
        if (!userConfirmed) {
            // Se o usuário não confirmar, previne a navegação
            history.pushState(null, '', window.location.href);
        } else {
            // Se o usuário confirmar, permite a navegação
            window.location.href = '../topico.html'; // ou outra URL de destino
        }
    });
});
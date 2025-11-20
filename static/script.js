class FoodSnapApp {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const ingredientsInput = document.getElementById('ingredientsInput');
        
        ingredientsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.analyzeIngredients();
            }
        });
    }

    async analyzeIngredients() {
        const ingredients = document.getElementById('ingredientsInput').value.trim();
        
        if (!ingredients) {
            alert('Пожалуйста, введите ингредиенты');
            return;
        }

        this.showLoading();
        
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredients: ingredients })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при генерации рецептов');
            }

            const result = await response.json();
            this.showResults(result);
            
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Произошла ошибка при генерации рецептов. Попробуйте еще раз.');
            this.reset();
        }
    }

    showLoading() {
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
        
        const ingredients = document.getElementById('ingredientsInput').value;
        const loadingText = document.querySelector('#loadingSection p');
        if (loadingText && ingredients) {
            loadingText.innerHTML = `Создаем рецепты из: <strong>${ingredients}</strong>...`;
        }
    }

    showResults(data) {
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        if (data.recipes) {
            document.getElementById('analysisContent').innerHTML = 
                this.formatRecipes(data.recipes);
        }

        if (data.social_content) {
            document.getElementById('socialContent').innerHTML = 
                this.formatSocialContent(data.social_content);
        }

        this.showUsedIngredients();
    }

    showUsedIngredients() {
        const ingredients = document.getElementById('ingredientsInput').value;
        const analysisTab = document.getElementById('analysisTab');
        
        let ingredientsHeader = analysisTab.querySelector('.used-ingredients');
        if (!ingredientsHeader) {
            ingredientsHeader = document.createElement('div');
            ingredientsHeader.className = 'used-ingredients';
            analysisTab.insertBefore(ingredientsHeader, analysisTab.firstChild);
        }
        
        ingredientsHeader.innerHTML = `
            <h4>🎯 Использованные ингредиенты:</h4>
            <p>${ingredients}</p>
        `;
    }

    formatRecipes(recipes) {
        return recipes.split('\n').map(line => {
            line = line.trim();
            
            if (line.startsWith('📋 РЕЦЕПТ')) {
                return `<h4 style="margin: 25px 0 15px 0; color: #1d1d1f; padding-bottom: 8px; border-bottom: 2px solid #007aff;">${line}</h4>`;
            }
            else if (line.startsWith('🍽️') || line.startsWith('⏱️') || line.startsWith('📖')) {
                return `<div style="margin: 12px 0; font-weight: 500; color: #007aff;">${line}</div>`;
            }
            else if (line.startsWith('- ') || line.startsWith('• ')) {
                return `<div style="margin: 6px 0; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 8px;">•</span>${line.substring(2)}</div>`;
            }
            else if (line.match(/^\d+\./)) {
                return `<div style="margin: 8px 0; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; font-weight: 500;">${line.split('.')[0]}.</span>${line.substring(line.indexOf('.') + 1)}</div>`;
            }
            else if (line.startsWith('💡 СОВЕТЫ:')) {
                return `<h4 style="margin: 25px 0 15px 0; color: #1d1d1f; padding: 10px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">${line}</h4>`;
            }
            else if (line.trim() === '') {
                return '<div style="height: 15px;"></div>';
            }
            else {
                return `<p style="margin: 8px 0;">${line}</p>`;
            }
        }).join('');
    }

    formatSocialContent(content) {
        return content.split('\n').map(line => {
            line = line.trim();
            
            if (line.startsWith('📸') || line.startsWith('🎥') || line.startsWith('📝') || line.startsWith('🔍')) {
                return `<h4 style="margin: 25px 0 15px 0; color: #1d1d1f; padding-bottom: 8px; border-bottom: 2px solid #28a745;">${line}</h4>`;
            }
            else if (line.startsWith('**Заголовок:**') || line.startsWith('**Тема:**') || line.startsWith('**Сценарий:**') || line.startsWith('**Тренды:**') || line.startsWith('**Введение:**')) {
                const parts = line.split(':**');
                if (parts.length > 1) {
                    return `<div style="margin: 12px 0;"><strong>${parts[0]}:**</strong>${parts[1]}</div>`;
                }
            }
            else if (line.startsWith('**Хештеги:**')) {
                const parts = line.split(':**');
                if (parts.length > 1) {
                    return `<div style="margin: 12px 0;"><strong>${parts[0]}:**</strong><span style="color: #007aff;">${parts[1]}</span></div>`;
                }
            }
            else if (line.startsWith('- ')) {
                return `<div style="margin: 6px 0; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 8px;">•</span>${line.substring(2)}</div>`;
            }
            else if (line.trim() === '') {
                return '<div style="height: 15px;"></div>';
            }
            else if (line.includes('**') && line.includes('**')) {
                return `<p style="margin: 12px 0; font-weight: 500;">${line.replace(/\*\*/g, '')}</p>`;
            }
            else {
                return `<p style="margin: 8px 0;">${line}</p>`;
            }
        }).join('');
    }

    reset() {
        document.getElementById('uploadSection').style.display = 'block';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        
        switchTab('analysis');
        
        const ingredientsHeader = document.querySelector('.used-ingredients');
        if (ingredientsHeader) {
            ingredientsHeader.remove();
        }
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

function analyzeIngredients() {
    window.foodSnapApp.analyzeIngredients();
}

function resetApp() {
    window.foodSnapApp.reset();
}

function fillExample(exampleNumber) {
    const examples = [
        "курица, рис, болгарский перец, морковь, лук, чеснок, соевый соус, имбирь",
        "яйца, молоко, мука, сахар, ванилин, разрыхлитель, ягоды, сливочное масло",
        "картофель, грибы, лук, сметана, сыр, зелень, специи, растительное масло",
        "помидоры, огурцы, болгарский перец, лук, оливковое масло, лимон, зелень, сыр фета"
    ];
    
    if (exampleNumber >= 1 && exampleNumber <= examples.length) {
        document.getElementById('ingredientsInput').value = examples[exampleNumber - 1];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.foodSnapApp = new FoodSnapApp();
});
// ************************************************************************************************
// 1-1 卡片列表渲染
// ------------------------------------------------------------------------------------------------
// 01 渲染列表
document.addEventListener('DOMContentLoaded', () => {
    renderCardList();
});

// 02 渲染列表函数
function renderCardList() {
    // 清空现有的卡片列表
    const list = document.getElementById('list');
    list.innerHTML = ''; // 清空已有内容

    // 读取数据并渲染卡片
    window.electron.readData().then(data => {
        data.forEach(cardData => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <div class="cardWord">
                    <b>${cardData.title}</b>
                    <p>${cardData.description}</p>
                </div>
                <div class="cardDelete">
                    <img class="delete" data-title="${cardData.title}" src="assets/icons/delete.svg">
                </div>
            `;
            list.appendChild(card);

            // 为卡片添加点击事件监听器
            card.addEventListener('click', () => {
                showCardDetails(cardData);
            });
        });
    }).catch(error => {
        console.error('Error reading data:', error);
    });
}

// 03 查看详情与转换文件函数
function showCardDetails(cardData) {
    const mainbar = document.getElementById('mainbar');
    mainbar.innerHTML = `
        <img id="mainbarLogo" src="assets/images/logoword.png">
        <div id="content">
            <b id="contentTitle">${cardData.title}</b>
            <b id="contentDescription">${cardData.description}</b>
            <p>
                <strong>HTML Template</strong>
                ${cardData.htmlPath}
            </p>
            <p>
                <strong>Markdown Folder</strong>
                ${cardData.mdPath}
            </p>
            <p>
                <strong>Storage Folder</strong>
                ${cardData.storagePath}
            </p>
        </div>
        <button id="convert">CONVERT</button>
    `;
    document.getElementById('convert').addEventListener('click', () => {
        // 获取卡片信息
        const convertData = {
            title: cardData.title,
            description: cardData.description,
            htmlPath: cardData.htmlPath,
            mdPath: cardData.mdPath,
            storagePath: cardData.storagePath
        };
    
        // 通过 IPC 发送卡片信息到主进程
        window.electron.convertMarkdown(convertData);
    });
    window.electron.onConvertResult((result) => {
        if (result.success) {
            alert('Conversion Succeeded!\nOutput: ' + result.output);
        } else {
            alert('Conversion Failed!\nError: ' + result.message);
        }
    });
}

// ************************************************************************************************
// 1-2 卡片创建
// ------------------------------------------------------------------------------------------------
// 01 建立添加表单
document.getElementById('add').addEventListener('click', function () {
    var form = document.createElement('form');
    form.innerHTML = `
        <img class="formLogo" src="assets/images/logo1.svg">

        <p>Title</p>
        <input id="formTitle" type="text" placeholder="Template Title">
        
        <p>Description</p>
        <input id="formDescription" type="text" placeholder="Template Description">

        <p>HTML Template</p>
        <div>
            <input id="htmlPath" type="text" placeholder="Select HTML Template File">
            <button type="button" id="selectTemplate">Select</button>
        </div>

        <p>Markdown Folder</p>
        <div>
            <input id="mdPath" type="text" placeholder="Select Markdown Folder">
            <button type="button" id="selectMarkdown">Select</button>
        </div>

        <p>Storage Folder</p>
        <div>
            <input id="storagePath" type="text" placeholder="Select Storage Folder">
            <button type="button" id="selectStorage">Select</button>
        </div>

        <div id="option">
            <button type="button" id="cancel">CANCEL</button>
            <button type="button" id="create">CREATE</button>
        </div>
    `;

    document.body.appendChild(form);

    // 为动态创建的按钮添加事件监听
    document.getElementById('selectTemplate').addEventListener('click', async () => {
        const filePath = await window.electron.selectFile();
        const filePathInput = document.getElementById('htmlPath');
        filePathInput.value = filePath || 'Unselected File';  // 将选择的文件路径显示在输入框中
    });

    document.getElementById('selectMarkdown').addEventListener('click', async () => {
        const folderPath = await window.electron.selectFolder();
        const filePathInput = document.getElementById('mdPath');
        filePathInput.value = folderPath || 'Unselected File';  // 将选择的文件夹路径显示在输入框中
    });

    document.getElementById('selectStorage').addEventListener('click', async () => {
        const folderPath = await window.electron.selectFolder();
        const filePathInput = document.getElementById('storagePath');
        filePathInput.value = folderPath || 'Unselected File';  // 将选择的文件夹路径显示在输入框中
    });
});

// 02 监听创建和取消按钮
document.body.addEventListener('click', function(event) {
    if (event.target.id === 'create') { // 点击CREATE按钮
        var title = document.getElementById('formTitle').value;
        var description = document.getElementById('formDescription').value;
        var html = document.getElementById('htmlPath').value;
        var md = document.getElementById('mdPath').value;
        var storage = document.getElementById('storagePath').value;

        // 确保所有信息都填写完整
        if (title && description && html && md && storage) {
            const templateData = {
                title: title,
                description: description,
                htmlPath: html,
                mdPath: md,
                storagePath: storage
            };

            // 将数据保存到 template.json 文件
            window.electron.saveData(templateData).then(() => {
                // 更新渲染卡片列表
                renderCardList();
                // 关闭表单窗口
                document.body.removeChild(document.querySelector('form'));
            }).catch(error => {
                console.error('Error saving data:', error);
                alert('Error saving data. Please try again.');
            });
        } else {
            alert('Please fill in the complete information!'); // 提示用户填写
        }
    } else if (event.target.id === 'cancel') { // 点击CANCEL按钮
        document.body.removeChild(document.querySelector('form'));
    }
});

// ************************************************************************************************
// 1-3 卡片删除
// ------------------------------------------------------------------------------------------------
document.getElementById('list').addEventListener('click', async function(event) {
    if (event.target.classList.contains('delete') || event.target.classList.contains('cardDelete')) {
        var card = event.target.closest('.card');
        var title = card.querySelector('.delete').getAttribute('data-title');

        try {
            const result = await window.electron.deleteData(title); // 调用删除数据功能
            if (result) {
                card.remove(); // 删除DOM中的卡片
                console.log('Data deleted successfully');
            } else {
                console.error('Failed to delete data');
            }
        } catch (error) {
            console.error('Error occurred while deleting data:', error);
        }
    }
});

// ************************************************************************************************
// 1-4 卡片搜索
// ------------------------------------------------------------------------------------------------
document.getElementById('search').addEventListener('input', function() {
    var keyword = this.querySelector('input').value.toLowerCase();
  
    // 遍历所有卡片
    var cards = document.querySelectorAll('.card');
    cards.forEach(function(card) {
      var title = card.querySelector('.cardWord b').innerText.toLowerCase();
      var description = card.querySelector('.cardWord p').innerText.toLowerCase();
  
      if (title.includes(keyword) || description.includes(keyword)) {
        card.style.display = 'flex'; // 显示匹配的卡片
      } else {
        card.style.display = 'none'; // 隐藏不匹配的卡片
      }
    });
});

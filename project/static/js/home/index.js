var page = 0;

const indicators = {
    '一年内被执行次数': 'first_year_executor_count',
    '二年内被执行次数': 'second_year_executor_count',
    '三年内被执行次数': 'third_year_executor_count',
    '一年内立案次数': 'first_year_registraion_count',
    '二年内立案次数': 'second_year_registraion_count',
    '三年内立案次数': 'third_year_registraion_count',
    '一年内裁判次数': 'first_year_judicial_count',
    '二年内裁判次数': 'second_year_judicial_count',
    '三年内裁判次数': 'third_year_judicial_count',
    '一年内涉案金额': 'first_year_involve_amt',
    '二年内涉案金额': 'second_year_involve_amt',
    '三年内涉案金额': 'third_year_involve_amt',
    '被执行次数指标': '',
    '立案次数指标': '',
    '裁判次数指标': '',
    '涉案金额指标': ''
}


let executorCountMin = document.getElementsByName('executorCountMin')[0];
let executorCountMax = document.getElementsByName('executorCountMax')[0];
let registraionCountMin = document.getElementsByName('registraionCountMin')[0];
let registraionCountMax = document.getElementsByName('registraionCountMax')[0];
let judicialCountMin = document.getElementsByName('judicialCountMin')[0];
let judicialCountMax = document.getElementsByName('judicialCountMax')[0];
let involveAmountMin = document.getElementsByName('involveAmountMin')[0];
let involveAmountMax = document.getElementsByName('involveAmountMax')[0];

let urlSearchParams = {
    'executor': '', 'registraion': '', 'judicial': '', 'involve': '', 'page': page,
}


// 判断指标类型
function isIndicator(text) {
    if (text.includes('执行')) {
        urlSearchParams['executor'] = indicators[text];
    } else if (text.includes('立案')) {
        urlSearchParams['registraion'] = indicators[text];
    } else if (text.includes('裁判')) {
        urlSearchParams['judicial'] = indicators[text];
    } else if (text.includes('涉案')) {
        urlSearchParams['involve'] = indicators[text];
    } else {
    }
}


// 分页回调函数
function pageselectCallback(page_index, jq) {
    page = page_index;
    urlSearchParams.page = page;
    search();
}

// 初始分页
function initPagination(total) {
    // Create pagination element
    $("#Pagination").pagination(total, {
        current_page: urlSearchParams.page,
        num_edge_entries: 1,
        num_display_entries: 10,
        items_per_page: 15,
        callback: pageselectCallback,
    });
}

// 加载分页
function loadPagination() {
    $.ajax({
        url: 'http://127.0.0.1:5000/api/total', data: {
            ...urlSearchParams, ...{
                'executorCountMin': executorCountMin.value,
                'executorCountMax': executorCountMax.value,
                'registraionCountMin': registraionCountMin.value,
                'registraionCountMax': registraionCountMax.value,
                'judicialCountMin': judicialCountMin.value,
                'judicialCountMax': judicialCountMax.value,
                'involveAmountMin': involveAmountMin.value,
                'involveAmountMax': involveAmountMax.value,
            }
        }
        , type: 'get', success: function (result) {
            initPagination(parseInt(result));
        }
    })
}

// 绑定下拉框事件
$('.dropdown__option').click(function () {
    $(this).closest('.dropdown').toggleClass('dropdown--opened');
    let option = document.querySelector(`.dropdown__selected .${this.classList[1]}`);
    let text = option.innerHTML;
    option.innerHTML = `${this.innerHTML}`;
    this.innerHTML = text;

    if (option.innerHTML == this.innerHTML) {
        return;
    } else {
        isIndicator(option.innerHTML.trim());
        urlSearchParams.page = 0;
        search();
        loadPagination();
    }
})


// 指定指标范围
let scopeNumber = document.querySelectorAll('.scope');
let regexp = new RegExp('\\d+');

// 输入框点击事件
scopeNumber.forEach(item => {
    item.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            let currentValue = document.getElementsByClassName(this.classList[1]);
            if (regexp.test(currentValue[0].value) && regexp.test(currentValue[1].value) && parseInt(currentValue[0].value) > parseInt(currentValue[1].value)) {
                alert("输入区间有误");
                for (let i = 0; i < currentValue.length; i++) {
                    currentValue[i].value = '';
                }
            } else {
                urlSearchParams.page=0;
                search();
                loadPagination();
            }
        }
    }, false)
})

// ajax请求获取数据
function search() {
    $.ajax({
        url: 'http://127.0.0.1:5000/api/search', data: {
            ...urlSearchParams, ...{
                'executorCountMin': executorCountMin.value,
                'executorCountMax': executorCountMax.value,
                'registraionCountMin': registraionCountMin.value,
                'registraionCountMax': registraionCountMax.value,
                'judicialCountMin': judicialCountMin.value,
                'judicialCountMax': judicialCountMax.value,
                'involveAmountMin': involveAmountMin.value,
                'involveAmountMax': involveAmountMax.value,
            }
        }, type: 'get', dataType: 'json', beforeSend: function () {
            $('#resp-table').removeClass('responstable').addClass('loading');
            $('#Pagination').css('display', 'none')
        }, complete: function () {
            $('#resp-table').removeClass('loading').addClass('responstable');
        }, success: function (data) {
            $('#resp-table').removeClass('loading').addClass('responstable');
            $('#Pagination').css('display', 'flex')
            let requestData = {
                ...urlSearchParams, ...{
                    'executorCountMin': executorCountMin.value,
                    'executorCountMax': executorCountMax.value,
                    'registraionCountMin': registraionCountMin.value,
                    'registraionCountMax': registraionCountMax.value,
                    'judicialCountMin': judicialCountMin.value,
                    'judicialCountMax': judicialCountMax.value,
                    'involveAmountMin': involveAmountMin.value,
                    'involveAmountMax': involveAmountMax.value,
                }
            };
            let params = '';
            Object.keys(requestData).forEach(key => {
                params += `${key}=${requestData[key]}&`;
            });

            let table = document.querySelector('.responstable tbody');
            table.innerHTML = '';
            data.forEach(item => {
                table.innerHTML += `<tr>
                    <td>${item.id}</td>
                    <td>${item.firm_name}</td>
                    <td>${item.usc_code}</td>
                    <td>${item.firm_type}</td>
                    <td>${item.est_date}</td>
                    <td><a href=/detail/${item.id}?${params}>
                        <ion-icon name="share-alt"></ion-icon>
                    </a></td>
                </tr>`;
            });
        }
    })
}


// 还原input框里的内容
function setRange(name, num){
    let inputDom = document.querySelector(`input[name="${name}"]`)
    inputDom.value = num;
}

// 通过value值获取key值
function getKey(obj, value, compare = (a, b)=> a===b){
    return Object.keys(obj).find(key => compare(obj[key], value))
}

// 一，二，三函数转数字
function toDigitalCase(numCC){
    let kanjiMapDigital = {'一': 1, '二': 2, '三': 3};
    return kanjiMapDigital[numCC];
}

// 设置原始指标位置
function setOriginLocation(indicatorDom, indicatorName){
    indicatorDom.innerHTML = indicatorName;
}

// 详情页返回保留状态
if (document.referrer.includes('detail')) {
    let referrerStr = document.referrer.split('?')[1];
    let URLSearch = new URLSearchParams(referrerStr);
    urlSearchParams = Object.fromEntries(URLSearch.entries());
    page = parseInt(urlSearchParams.page);

    // 从详情页返回到首页还原之前的状态
    Object.keys(urlSearchParams).forEach(item=>{
        if(urlSearchParams[item] === '' || item === 'page'){
            return;
        }
        if(item.includes('Min') || item.includes('Max')){
            setRange(item, urlSearchParams[item]);
        }else{
            let selectOption = getKey(indicators, urlSearchParams[item]);
            let indicatorAll = document.querySelectorAll(`.${item}`);
            indicatorAll[0].innerHTML = selectOption;
            let optionIndex = toDigitalCase(selectOption[0]);
            if(selectOption.includes('执行')) setOriginLocation(indicatorAll[optionIndex], '被执行次数指标');
            else if(selectOption.includes('立案')) setOriginLocation(indicatorAll[optionIndex], '立案次数指标');
            else if(selectOption.includes('裁判')) setOriginLocation(indicatorAll[optionIndex], '裁判次数指标');
            else if(selectOption.includes('涉案')) setOriginLocation(indicatorAll[optionIndex], '涉案金额指标');
        }

    })
}
// 加载首页
search();
loadPagination();
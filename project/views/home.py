from flask import Blueprint, render_template, request, jsonify

from sqlalchemy import and_

from models import EnterpriseInfo, EnterpriseInfoSchema

# 创建一个蓝图
home = Blueprint('home', __name__)


class RequestArgs:
    def __init__(self):
        self.sql = []
        self.executor = request.args.get('executor')
        self.registraion = request.args.get('registraion')
        self.judicial = request.args.get('judicial')
        self.involve = request.args.get('involve')
        self.page = request.args.get('page')
        self.executorCount = {'Min': request.args.get('executorCountMin', ''), 'Max': request.args.get('executorCountMax', '')}
        self.registraionCount = {'Min': request.args.get('registraionCountMin', ''),
                                 'Max': request.args.get('registraionCountMax', '')}
        self.judicialCount = {'Min': request.args.get('judicialCountMin', ''), 'Max': request.args.get('judicialCountMax', '')}
        self.involveAmount = {'Min': request.args.get('involveAmountMin', ''), 'Max': request.args.get('involveAmountMax', '')}

    def get_range_number(self, indicators, indicators_range):
        min = indicators_range.get('Min')
        max = indicators_range.get('Max')

        if min == '' and max == '':
            return

        if min != '' and max != '':
            self.sql.append(f'EnterpriseInfo.{indicators}>={min}, EnterpriseInfo.{indicators}<={max}')
        elif min:
            self.sql.append(f'EnterpriseInfo.{indicators}=={min}')
        else:
            self.sql.append(f'EnterpriseInfo.{indicators}=={max}')

    @property
    def get_sql(self):
        if self.executor:
            self.sql.append(f'EnterpriseInfo.{self.executor}>0')
            self.get_range_number(self.executor, self.executorCount)
        else:
            self.get_range_number('third_year_executor_count', self.executorCount)

        if self.registraion:
            self.sql.append(f'EnterpriseInfo.{self.registraion}>0')
            self.get_range_number(self.registraion, self.registraionCount)
        else:
            self.get_range_number('third_year_registraion_count', self.registraionCount)

        if self.judicial:
            self.sql.append(f'EnterpriseInfo.{self.judicial}>0')
            self.get_range_number(self.judicial, self.judicialCount)
        else:
            self.get_range_number('third_year_judicial_count', self.judicialCount)

        if self.involve:
            self.sql.append(f'EnterpriseInfo.{self.involve}>0')
            self.get_range_number(self.involve, self.involveAmount)
        else:
            self.get_range_number('third_year_involve_amt', self.involveAmount)

        if not self.sql:
            return self.sql
        if len(self.sql) == 1:
            return self.sql[0]
        else:
            return f"and_({','.join(self.sql)})"

# 数据获取
@home.route('/api/search')
def api_search():
    args = RequestArgs()
    enterprise_info_schema = EnterpriseInfoSchema(many=True)
    print(args.get_sql)
    if args.get_sql:
        enterprise_info = EnterpriseInfo.query.filter(eval(args.get_sql)).offset(int(args.page) * 15).limit(15)
    else:
        enterprise_info = EnterpriseInfo.query.offset(int(args.page) * 15).limit(15)

    enterprise_info_json = enterprise_info_schema.dumps(enterprise_info, ensure_ascii=False)

    return enterprise_info_json

# 数据量获取
@home.route('/api/total')
def api_total():
    args = RequestArgs()
    print(args.get_sql)
    if args.get_sql:
        total = EnterpriseInfo.query.filter(eval(args.get_sql)).count()
    else:
        total = EnterpriseInfo.query.count()
    print(total)
    return jsonify(total)


# 首页
@home.route('/home/')
def index():
    return render_template('home/index.html')

# 首页
@home.route('/detail/<int:id>')
def detail(id):
    enterprise = EnterpriseInfo().query.get(id)

    return render_template('home/detail.html', locals=locals())

from flask import Flask, url_for
from flask_wtf import CSRFProtect
from flask_migrate import Migrate
from flask_bootstrap import Bootstrap4

from exts import *

from views import home

# 创建Flask app 对象
app = Flask(__name__)
# 引入mysql配置
app.config.from_pyfile('config.py')
# 使用扩展初始化应用程序
db.init_app(app)
ma.init_app(app)

bootstrap4 = Bootstrap4(app)

# csrf保护
csrf = CSRFProtect(app)
# 将密钥设置为一些随机字节。
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

# 注册蓝图
app.register_blueprint(home.home, url_prefix = '/')

# 数据库迁移
migrate = Migrate(app, db)

# 反向生成模型类（需要包含id自增主键）
# pip install flask-sqlacodegen
# flask-sqlacodegen  mysql://root:123456@localhost:3306/project --outfile models.py --flask

with app.test_request_context():
    print(url_for('home.index'))


if __name__ == '__main__':
    app.run()

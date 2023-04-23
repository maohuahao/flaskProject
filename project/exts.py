from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow

# 创建操作模型对象的对象
db = SQLAlchemy()

# 数据序列化
ma = Marshmallow()

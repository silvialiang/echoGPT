from flask import Flask, request, jsonify, send_from_directory, abort
from user.userSearch import UserSearch
from user.dataprepare import CSVReader
#from database.dbManager import DatabaseManager

app = Flask(__name__)

my_data = CSVReader()
my_data.read_csv_files()

#my_database = DatabaseManager()


@app.route('/')
def index():
    return send_from_directory('app/templates', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    if filename.endswith(('.js', '.css', '.jpg', '.png', '.gif', '.eot', '.otf',
                          '.svg', '.ttf', '.woff', '.woff2', '.ico')):
        directory = 'app/static/css'
        if filename.endswith(('.js')):
            directory = 'app/static/js'
        return send_from_directory(directory, filename)
    else:
        abort(404)

@app.route('/users', methods=['GET'])
def get_user():
    query = request.args.get('q', '')
    users = my_data.get_users(query)
    print(users)
    return jsonify({'data': users})

@app.route('/user', methods=['GET'])
def get_user_data():
    query = request.args.get('q', '')
    #data,persona = my_data.get_data(query)
    data= my_data.get_data(query)
    return jsonify({'data': data})#,'persona':persona})
"""
@app.route('/balance', methods=['GET'])
def balance():
    my_binance = BinanceFutureAPI()
    balance = my_binance.get_balance()
    res = {}
    for asset in balance:
        total = float(asset['balance']) + float(asset['crossUnPnl'])
        if total > 0.00001:
            avl = float(asset['availableBalance'])
            frozen = total - avl
            res[asset['asset']] = {
                'available': avl,
                'frozen': frozen,
                'balance': total
            }
    return jsonify(res)

@app.route('/mfee', methods=['GET'])
def mfee():
    my_binance = BinanceMarginAPI()
    fee = my_binance.get_margin_fee()
    return jsonify(fee)

@app.route('/fee', methods=['GET'])
def fee():
    my_binance = BinanceFutureAPI()
    fee = my_binance.get_fee()
    return jsonify(fee)

@app.route('/feehistory', methods=['POST'])
def feehistory():
    data = request.form
    symbol = data['symbol']
    if symbol.endswith('_PERP'):
        my_binance = BinanceMarginAPI()
    else:
        my_binance = BinanceFutureAPI()
    fee = my_binance.get_history_fee(symbol)
    return jsonify(fee)
"""



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)



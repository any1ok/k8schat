from flask import Flask, render_template, request, make_response, g
from redis import Redis
import os
import socket
import random
import json
import logging

option_a = os.getenv('OPTION_A', "Cats")
option_b = os.getenv('OPTION_B', "Dogs")
hostname = socket.gethostname()

app = Flask(__name__)

gunicorn_error_logger = logging.getLogger('gunicorn.error')
app.logger.handlers.extend(gunicorn_error_logger.handlers)
app.logger.setLevel(logging.INFO)

# def get_redis():
#     if not hasattr(g, 'redis'):
#         g.redis = Redis(host="redis", db=0, socket_timeout=5)
#     return g.redis

@app.route("/", methods=['POST','GET'])
def hello():
    voter_id = request.cookies.get('voter_id')
    if not voter_id:
        voter_id = hex(random.getrandbits(64))[2:-1]

    chat = None

    if request.method == 'POST':
        # redis = get_redis()
        chat = request.form['chat']
        # user_input = request.form['user_input']
        print(chat)
        # print(user_input)
        app.logger.info('Received vote for %s', chat)
        data = json.dumps({'voter_id': voter_id, 'vote': chat})
        # redis.rpush('votes', data)

    resp = make_response(render_template(
        'index.html',
        option_a=option_a,
        option_b=option_b,
        hostname=hostname,
        vote=chat,
    ))
    resp.set_cookie('voter_id', voter_id)
    return resp


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80, debug=True, threaded=True)

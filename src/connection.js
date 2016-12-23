import ISocketConnection from 'odss.io.api';
import autobahn from './autobahn.min';

export default class AutobahnConnection{

    constructor(options){
        this._session = null;
        this._conn = new autobahn.Connection({
            url: options.url,
            realm: options.realm,
            onchallenge: (...args) => {
                return options.ticket;
            },
            authid: options.authid,
            authmethods:['ticket'],
            use_es6_promises: true
        });
    }

    open(){
        return new Promise((resolve, reject) => {
            this._conn.onopen = session => {
                this._session = session;
                this._conn.onclose = function(...args){
                    console.log(...args);
                };
                resolve();
            };
            this._conn.onclose = (error, detail) => reject(error, detail);
            this._conn.open();
        });
    }

    close(){
        return this._conn.close();
    }

    call(topic, args=[]){
        return this._session.call(topic, args);
    }

    register(topic, handler){
        return new Promise((resolve, reject) => {
            this._session.register(topic, handler).then(registration => {
                resolve(() => {
                    return this._session.unregister(registration);
                })
            }).catch(reject);
        });
    }

    publish(topic, args){
        return this._session.publish(topic, args);
    }

    subscribe(topic, handler){
        return new Promise((resolve, reject) => {
            this._session.subscribe(topic, handler).then(subscription => {
                resolve(() => {
                    return this._session.unsubscribe(subscription);
                })
            }).catch(reject);
        });
    }
}

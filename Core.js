import fs from "fs";
import MTProto from "@mtproto/core"
import { sleep } from '@mtproto/core/src/utils/common/index.js';

class Core {
    store = fs.existsSync('store.json')
        ? JSON.parse(fs.readFileSync('store.json', 'utf8'))
        : {}

    async call(method, params, options) {
        try {
            const result = await this.mtproto.call(method, params, options)
 
            return Core.successHandler(result);
        } catch (err){
            const { error_code, error_message } = err

            if (error_code === 420) {
                const seconds = Number(error_message.split('FLOOD_WAIT_')[1]);
                const ms = seconds * 1000;

                await sleep(ms);

                return this.call(method, params, options);
            }

            if (error_code === 303) {
                const [type, dcIdAsString] = error_message.split('_MIGRATE_');

                const dcId = Number(dcIdAsString);

                // If auth.sendCode call on incorrect DC need change default DC, because
                // call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
                if (type === 'PHONE') {
                    await this.mtproto.setDefaultDc(dcId);
                } else {
                    Object.assign(options, { dcId });
                }

                return this.call(method, params, options);
            }

            return Core.errorHandler(err);
        }
    }

    auth (id) {
        this.user = this.getUser(id);

        const {tempStorage, mtproto} = this.initMTProto(this.user.storage)
        this.tempStorage = tempStorage
        this.mtproto = mtproto
    }

    getUser (id) {
        const users = this.store.users
            ? this.store.users
            : this.store.users = []

        const user = users.find(user => user.id === id)
            || users[users.push({
                id: id,
                storage: {}
            }) - 1]

        if (!user.storage) user.storage = {}

        return user
    }

    initMTProto (storage) {
        const tempStorage = new Map(Object.entries(storage))

        return {
            tempStorage,
            mtproto: new MTProto({
                api_id: "YOU_API_ID",
                api_hash: "YOU_API_HASH",

                storageOptions: {
                    instance: tempStorage,
                },
            })
        }
    }

    save(){
        this.user.storage = Object.fromEntries(this.tempStorage);
        fs.writeFileSync('store.json', JSON.stringify(this.store))
    }

    static successHandler(result) {
        return {
            success: true,
            data: result
        }
    }

    static errorHandler(err) {
        return {
            success: false,
            error: {
                error_code: 'error_code' in err
                    ? err.error_code
                    : 400,
                error_message: 'error_message' in err
                    ? err.error_message
                    : err.message
            }
        }
    }
}

export default Core
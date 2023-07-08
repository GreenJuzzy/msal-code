class MSAL {

    constructor(client_id, scope) {

        this._events = {}
        this.client_id = client_id

        this.generateData = {
            method: "POST",
            body: new URLSearchParams({ scope, client_id, "response_type": "device_code" }).toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }

    }

    async getCode() {

        const getTime = Date.now()
        return new Promise(async (resolve, reject) => {
            try {
                await fetch("https://login.live.com/oauth20_connect.srf", this.generateData).then(res => res.json()).then(async result => {

                    resolve(result)

                    const expireTime = getTime + result.expires_in * 1000
                    var received = false

                    while (expireTime >= Date.now() && !received) {

                        await new Promise((resolve) => setTimeout(resolve, result.interval * 1000))

                        const checkData = {
                            method: "POST",
                            body: new URLSearchParams({ client_id: this.client_id, device_code: result.device_code, grant_type: "urn:ietf:params:oauth:grant-type:device_code" }).toString(),
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        }


                        await fetch("https://login.live.com/oauth20_token.srf", checkData).then(res => res.json()).then(tokenResult => {

                            if (tokenResult.error) {
                                if (tokenResult.error !== "authorization_pending") return this.emit("error", tokenResult)
                            } else {
                                received = true
                                this.emit("granted", tokenResult)
                            }


                        })
                    }
                })

            } catch (e) {
                reject(e)
            }
        })

    }

    on(name, listener) {
        if (!this._events[name]) this._events[name] = []

        this._events[name].push(listener)
    }

    emit(name, data) {
        if (!this._events[name]) return;
        const fire = (callback) => callback(data)

        this._events[name].forEach(fire)
    }

}


module.exports = (client_id, scope) => {
    if (!client_id) throw new Error("Missing client_id parameter")
    if (!scope) throw new Error("Missing scope parameter")

    return new MSAL(client_id, scope)
}


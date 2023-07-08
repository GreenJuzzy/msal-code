type EventList = "granted" | "error"

type userCode = {
    user_code: string,
    device_code: string,
    verification_uri: string,
    interval: Number,
    expires_in: Number
}

declare class MSAL {
    private _events

    public getCode(): Promise<userCode>

    private emit

    public on(name: EventList, callback: Function)
}

declare function init(): MSAL

export = init
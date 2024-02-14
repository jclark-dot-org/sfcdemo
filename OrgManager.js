import { Org, StateAggregator } from '@salesforce/core';

let orgManager;

class OrgManager {
    contents;
    stateAggregator;

    // PRIVATE, use getInstance()
    constructor() {
        this.contents = new Map();
    }

    static async getInstance() {
        if (!orgManager) {
            orgManager = new OrgManager();
            orgManager.stateAggregator = await StateAggregator.getInstance();
            // read all org files
            const orgs = await orgManager.stateAggregator.orgs.readAll();

            // check connection status of all orgs
            await Promise.allSettled( orgs.map( o => {
                return new Promise((resolve, reject) => {
                    Org.create({ aliasOrUsername: o.username })
                        .then( org => org.refreshAuth())
                        .then( () => {o.authStatus = 'Connected'})
                        .catch( err => {o.authStatus = err.toString().replace(/^Error: ?/, '')})
                        .finally( () => {resolve()});
                })
            }));
            const aliases = orgManager.stateAggregator.aliases;
            orgs.forEach(org => {
                const alias = aliases.get(org.username);
                const orgInfo = new Organization(org, alias);
                orgManager.contents.set(org.username, orgInfo);
                if (alias) {
                    orgManager.contents.set(alias, orgInfo);
                }
            });
        }
        return orgManager
    }

    getOrgList() {
        return Array.from(this.contents.values());
    }

    getOrgInfo(userNameOrAlias) {
        return this.contents.get(userNameOrAlias)
    }

    getConnection(username, apiVersion) {
        console.log("getConnection: ", username);
        return new Promise((resolve, reject)=> {
            this.stateAggregator.orgs.read(username)
                .then(authInfo => {console.log("authInfo: ", authInfo); return Org.create(authInfo)})
                .then(org => {console.log("org: ", org); return org.getConnection(apiVersion)})
                .then(conn => {console.log("conn: ", conn); resolve(conn)})
                .catch(err => reject(err));
        });
    }

}

class Organization {

    constructor(org, alias) {
        this.accessToken = org.accessToken;
        this.alias = org.alias;
        this.authStatus = org.authStatus;
        this.clientId = org.clientId;
        this.created = org.created;
        this.createdOrgInstance = org.createdOrgInstance;
        this.devHubUsername = org.devHubUsername;
        this.expirationDate = org.expirationDate;
        this.instanceApiVersion = org.instanceApiVersion;
        this.instanceApiVersionLastRetrieved = org.instanceApiVersionLastRetrieved;
        this.instanceUrl = org.instanceUrl;
        this.isDevHub = org.isDevHub;
        this.isScratch = (typeof org.isScratch === 'function') ? org.isScratch() : org.isScratch;
        this.loginUrl = org.loginUrl;
        this.orgId = org.orgId;
        this.refreshToken = org.refreshToken;
        this.username = org.username;

        if (alias) {
            this.alias = alias;
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            Org.create({ aliasOrUsername: this.username })
                .then( org => org.getConnection())
                .then( conn => {
                    console.log('Connected to ' + (this.alias || this.username) + '; apiVersion: ' + conn.getApiVersion());
                    resolve(conn);
                });
        });
    }

}

export { OrgManager, Organization }
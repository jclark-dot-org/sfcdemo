import { OrgManager, Organization } from './OrgManager.js'

// A Simple demo to use a connection to run a query

async function openOrg(alias) {
    const orgManager = await OrgManager.getInstance();
    const orgInfo = orgManager.getOrgInfo(alias);
    console.error("openOrg: orgInfo", orgInfo);

    const connection = await orgManager.getConnection(orgInfo.username, '36.0');
    console.log("Connection username: ", connection.username);
    console.log("Connection instanceUrl: ", connection.instanceUrl);
    connection.query('SELECT Id, Name FROM Account LIMIT 5', function(err, index) {
        console.log('query completed');
        if (err) { return console.error(err); }
        console.log('results: ', result);
    });

}

const args = process.argv.slice(2);
const alias = args[0];
openOrg(alias);
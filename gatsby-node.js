const request = require('request-promise');
const dir = require('node-dir');
const path = require('path');
const assert = require('assert');

exports.sourceNodes = async (
    { boundActionCreators: { createNode }, createNodeId },
    {
        folderPath = '.',
        gitRepoRoot = '.',
        gitlab: { domain, projectId, privateToken } = {}
    }
) => {
    assert(domain, 'options.gitlab.domain object required');
    assert(projectId, 'options.gitlab.projectId object required');
    assert(privateToken, 'options.gitlab.privateKey object required');

    const gitlabReq = request.defaults({
        baseUrl: domain,
        json: true,
        fullResponse: false,
        headers: {
            'Private-Token': privateToken
        }
    });

    return dir
        .promiseFiles(path.resolve(folderPath))
        .then(files => {
            const gitRepoRootFullPath = `${path.resolve(gitRepoRoot)}${path.sep}`;

            const relativeFilePaths = files.map(
                file => `${file.split(gitRepoRootFullPath)[1]}`
            );

            const promises = relativeFilePaths.map(filePath =>
                gitlabReq({
                    url: `/api/v4/projects/${projectId}/repository/files/${encodeURIComponent(
                        filePath
                    )}`,
                    qs: {
                        ref: 'master'
                    }
                }).then(({ content, ...file }) => // eslint-disable-line no-unused-vars
                    gitlabReq({
                        url: `/api/v4/projects/${projectId}/repository/commits/${
                            file.last_commit_id
                        }`
                    }).then(latestCommit => ({
                        id: createNodeId(`gitlab-file-${filePath}`),
                        children: [],
                        parent: null,
                        file,
                        latestCommit,
                        internal: {
                            type: 'GitlabFile',
                            content: JSON.stringify({
                                file,
                                latestCommit
                            }),
                            contentDigest: file.content_sha256
                        }
                    }))
                ).catch(() => null)
            );

            return Promise.all(promises);
        })
        .then(results => {
            results.forEach(file => {
                if (file) {
                    createNode(file);
                }
            });
        });
};

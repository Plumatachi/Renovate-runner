module.exports = {
    platform: 'github',
    // endpoint: 'https://ton-gitlab.com/api/v4',
    repositories: [
        'Plumatachi/pokedex',
    ],
    onboarding: false,
    requireConfig: 'optional',
    automerge: false,        // validation manuelle des MR
    labels: ['renovate'],
    logLevel: 'debug',
    // regrouper les updates non-critiques en une seule MR
    groupName: 'all non-major dependencies',
};
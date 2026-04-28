module.exports = {
    platform: 'github',
    autodiscover: false,       // ne pas découvrir automatiquement des dépôts (temporaire)
    autodiscoverFilter: ['Plumatachi/*'],       // permet de filtrer les dépôts à découvrir
    repositories: [
        'Plumatachi/bookly',
    ],
    onboarding: false,
    requireConfig: 'optional',
    automerge: false,          // validation manuelle des MR
    labels: ['renovate'],
    logLevel: 'debug',

    // Fréquence : une fois par semaine
    schedule: ['on monday'],

    // Regroupement par type de mise à jour
    packageRules: [
        {
            matchUpdateTypes: ['patch'],
            groupName: 'patch updates',
        },
        {
            matchUpdateTypes: ['minor'],
            groupName: 'minor updates',
        },
        {
            matchUpdateTypes: ['major'],
            groupName: 'major updates',
        },
    ],
};
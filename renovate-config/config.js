module.exports = {
    platform: 'github',
    autodiscover: true,       // permet de découvrir automatiquement des dépôts
    autodiscoverFilter: ['Plumatachi/*'],       // permet de filtrer les dépôts à découvrir
    // repositories: [
    //     'Plumatachi/bookly',
    // ],
    onboarding: false,
    requireConfig: 'optional',
    automerge: false,          // validation manuelle des MR
    labels: ['renovate'],
    logLevel: 'debug',
    recreateClosed: true,      // permet de re-créer les MR fermées (actif seulement pour les tests)

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
# Guide de contributting
## Nous utilisons la stretegie de branches (trunk-based)
1 - convention de branches : nom_de_branche/SCRUM-XX-description
    exemple : 
        feature/SCRUM-19-user-authentification
2 - convention de commits : (feat,fix,refactor,docs,test,...) : description courte
        exemple :
            fix : jwt expiration isue
3 - PULL REQUEST 
        - Chaque pull request a besoin de minumin d'une seule approbation
        - Personne ne doit merger sa propre PR
        - La pipeline CI doit etre en succés avant le merge
4 - Branche Main :
        Des Push directement dans main n'est pas autorisé 

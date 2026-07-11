# WebStorming OS V1.1.1 Voice Fix

Correctif du module vocal.

## Problème corrigé

La première version pouvait afficher **« Transcription prête »** alors qu’aucune parole n’avait réellement été reconnue.  
Le texte d’aide était confondu avec une transcription.

## Corrections

- la validation dépend maintenant uniquement du vrai résultat vocal ;
- message clair lorsqu’aucune parole n’est détectée ;
- bouton **Arrêter l’écoute** pendant l’enregistrement ;
- arrêt automatique après 15 secondes ;
- erreurs micro, réseau et autorisation mieux expliquées ;
- aucune insertion si la transcription est vide ;
- le reste du cockpit continue normalement en cas d’échec vocal.

## Conseil navigateur

La reconnaissance vocale du Web Speech API a une disponibilité limitée selon le navigateur. Pour cette build, utiliser de préférence **Google Chrome** ou **Microsoft Edge**, puis autoriser le microphone.

## Publication

1. Décompresser.
2. Remplacer les fichiers du dépôt.
3. Faire **Commit changes** sur `main`.
4. Attendre le déploiement vert.
5. Recharger avec `Ctrl + F5`.
6. Tester en disant immédiatement : « ouvre Journalia ».

## Build

- Version : 1.1.1 Voice Fix
- Build : WS111VF

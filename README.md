![Formatic Fobs logo](./public/readme/formatic-fobs-logo.png)

## _Promo video_

![Formatic Fobs promo video](./public/readme/Formatic-Fobs-Promo.mp4)

## _Exhibit at the event_

![Photo of exhibit](./public/readme/IMG_1726.png)

## _Queue system_

![Photo of queue system](./public/readme/IMG_1729.png)

## _Printing created fobs_

![Photo of 3d printer](./public/readme/IMG_1730.png)

## _Exhibit in action_

![Video of exhibit](./public/readme/Mvi%201085.mp4)

## .env

```
POSTGRES_USER= # postgres username
POSTGRES_PASSWORD= # postgres password
DB_HOST= # hostname (usually localhost)
POSTGRES_DB= # postgres db name
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${DB_HOST}:5432/${POSTGRES_DB}?schema=public
OUTPUTS_PATH= # path to your 'outputs' folder (create one in root of project)
PRUSA_CLI_PATH= # path to the PrusaSlicer CLI
PRUSA_INI= # .ini file in the cfg folder
COM= # COM port of your 3D printer
NEXT_PUBLIC_PORT= # port for the Express server
```

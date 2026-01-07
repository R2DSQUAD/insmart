
"use client";
import React from "react";
import { useTranslations } from "next-intl";

import styles from "../styles/index.module.css";

export default function IndexComponent() {
  const t = useTranslations();

  // 카드 정보 배열
  const cards = [
    {
      title: t("admin.title"),
      subtitle: t("admin.subtitle"),
      items: [t("admin.item1"), t("admin.item2")],
      icon: "/images/icon-admin.png",
      href: "/admin",
    },
    {
      title: t("personal.title"),
      subtitle: t("personal.subtitle"),
      items: [t("personal.item1"), t("personal.item2")],
      icon: "/images/icon-personal.png",
      href: "/personal",
    },
    {
      title: t("inmedic.title"),
      subtitle: t("inmedic.subtitle"),
      items: [t("inmedic.item1"), t("inmedic.item2")],
      icon: "/images/icon-inmedic.png",
      href: "https://inmedic.co.kr/experience_service",
    },
  ];

  return (
    <div className={styles.index}>
      <div className={styles.indexContainer}>
        <div className={styles.videoContainer}>
          <video autoPlay muted loop className={styles.video}>
            <source src="/videos/seasonWorkerVideo.mp4" type="video/mp4" />
          </video>
        </div>
        <div className={styles.indexContent}>
          <div className={styles.indexTitle}>
            <svg
              width="401"
              height="56"
              viewBox="0 0 401 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M33.4015 21.2228V0.535156H23.6875V13.7855V15.839L23.7455 17.1592C24.0512 20.8588 25.6324 24.1836 28.0412 26.6664C30.7293 29.437 34.4399 31.1483 38.5406 31.1483H53.3883V21.2228H33.4015Z"
                fill="#28FEC6"
              />
              <path
                d="M14.8531 24.1656H0V34.0911H20.0711V54.7787H29.7008V39.4695C29.7008 31.0162 23.0491 24.1602 14.8478 24.1602L14.8531 24.1656Z"
                fill="#007BFF"
              />
              <path
                d="M78.1494 1.50195V54.3691H71.0938V1.50195H78.1494Z"
                fill="#007BFF"
              />
              <path
                d="M131.906 44.8918V1.50195H138.962V54.3691H128.872L97.7744 10.9739V54.3691H90.7188V1.50195H100.809L131.906 44.8972V44.8918Z"
                fill="#007BFF"
              />
              <path
                d="M151.529 54.3691V1.50195H162.611L181.469 43.2401L200.268 1.50195H211.35V54.3691H204.294V10.6002L184.663 54.3691H178.21L158.579 10.6002V54.3691H151.523H151.529Z"
                fill="#007BFF"
              />
              <path
                d="M264.741 1.50195V9.92323H230.999V23.7601H263.642V32.1056H230.999V46.0183H264.741V54.3637H223.938V1.50195H264.741Z"
                fill="#007BFF"
              />
              <path
                d="M304.037 1.50195C314.292 1.50195 323.06 9.92323 323.06 27.9735C323.06 46.0237 314.292 54.3691 304.037 54.3691H276.305V1.50195H304.037ZM283.36 45.7962H300.453C310.431 45.7962 315.508 42.4873 315.508 27.9735C315.508 13.4596 310.436 10.0749 300.453 10.0749H283.36V45.7962Z"
                fill="#007BFF"
              />
              <path
                d="M341.134 1.50195V54.3691H334.078V1.50195H341.134Z"
                fill="#007BFF"
              />
              <path
                d="M376.978 0C391.702 0 399.254 9.09823 400.411 20.6064H392.801C391.756 13.0841 386.406 8.57291 376.978 8.57291C366.226 8.57291 359.72 14.2106 359.72 27.9012C359.72 41.5919 366.279 47.3054 376.978 47.3054C386.353 47.3054 391.756 42.6425 392.801 35.1202H400.464C399.254 46.7042 391.697 55.8783 376.978 55.8783C360.216 55.8783 352.109 44.9712 352.109 27.9012C352.109 10.8312 360.216 0 376.978 0Z"
                fill="#007BFF"
              />
            </svg>
            <h2>{t("계절근로자_구독_서비스")}</h2>
          </div>
          <div className={styles.indexDescription}>
            <img
              src="/images/indexDescriptionImage.png"
              alt="캐릭터 이미지"
              className={styles.descriptionImage}
            />
            <div className={styles.descriptionBox}>
              <span className={styles.descriptionTitle}>
                {t("외국인_계절근로자_단체_상해_보험")}
              </span>
              <p className={styles.descriptionContent}>
                {t("의료_통역부터_보험처리까지")}
              </p>
              <p className={styles.descriptionContent}>
                {t("쉽고_간편하게_제공합니다")}
              </p>
            </div>
          </div>
          <div className={styles.cardRow}>
            {cards.map((card, idx) => (
              <a
                key={idx}
                href={card.href}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>{card.title}</span>
                  {card.subtitle && (
                    <span className={styles.cardSubtitle}>{card.subtitle}</span>
                  )}
                </div>
                <ul className={styles.cardList}>
                  {card.items.map((item, i) => (
                    <li key={i}>⦁ {item}</li>
                  ))}
                </ul>
                {idx === 0 && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="95" height="97" viewBox="0 0 95 97" fill="none" className={styles.cardIcon}>
                    <path d="M44.0996 1.97318C47.5829 -0.657727 52.4245 -0.657727 55.9078 1.97318L97.2574 33.1576C102.524 37.1287 99.6991 45.416 93.0825 45.4489H6.9166C0.30833 45.416 -2.52498 37.1287 2.74997 33.1576L44.0996 1.97318ZM49.9995 31.0611C51.6571 31.0611 53.2468 30.4115 54.4189 29.2551C55.591 28.0987 56.2495 26.5303 56.2495 24.895C56.2495 23.2596 55.591 21.6912 54.4189 20.5348C53.2468 19.3784 51.6571 18.7288 49.9995 18.7288C48.342 18.7288 46.7523 19.3784 45.5802 20.5348C44.4081 21.6912 43.7496 23.2596 43.7496 24.895C43.7496 26.5303 44.4081 28.0987 45.5802 29.2551C46.7523 30.4115 48.342 31.0611 49.9995 31.0611ZM12.4999 53.6705V78.3352H24.9998V53.6705H12.4999ZM33.333 53.6705V78.3352H45.8329V53.6705H33.333ZM54.1662 53.6705V78.3352H66.6661V53.6705H54.1662ZM74.9993 53.6705V78.3352H87.4992V53.6705H74.9993ZM0 96.8338C0 91.1609 4.66662 86.5568 10.4166 86.5568H89.5825C95.3325 86.5568 99.9991 91.1609 99.9991 96.8338V98.8892C99.9991 99.9795 99.5601 101.025 98.7787 101.796C97.9973 102.567 96.9375 103 95.8325 103H4.16663C3.06157 103 2.00177 102.567 1.22038 101.796C0.438984 101.025 0 99.9795 0 98.8892V96.8338Z" fill="#F8FAFB"/>
                  </svg>
                )}
                {idx === 1 && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="78" viewBox="0 0 96 78" fill="none" className={styles.cardIcon}>
                    <path d="M82.9779 37.828C92.4428 37.828 100.586 29.4992 100.586 18.6532C100.586 7.93811 92.4 0 82.9779 0C73.5579 0 65.37 8.11127 65.37 18.7398C65.37 29.4992 73.5128 37.828 82.9779 37.828ZM32.31 38.8268C40.4979 38.8268 47.6314 31.537 47.6314 22.1228C47.6314 12.7973 40.4529 5.89815 32.31 5.89815C24.1243 5.89815 16.9029 12.9704 16.9479 22.2115C16.9479 31.537 24.0793 38.8268 32.3121 38.8268M7.74857 78H41.2029C36.6257 71.4493 42.2164 58.2614 51.6814 51.0603C46.7957 47.8504 40.4979 45.4641 32.2671 45.4641C12.4136 45.462 0 59.9064 0 71.9245C0 75.8312 2.20071 78 7.74857 78ZM55.29 78H110.623C117.534 78 120 76.0466 120 72.2286C120 61.0362 105.78 45.5929 82.935 45.5929C60.1329 45.5929 45.9129 61.0362 45.9129 72.2307C45.9129 76.0466 48.3771 78 55.29 78Z" fill="#F8FAFB"/>
                  </svg>
                )}
                {idx === 2 && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="87" height="78" viewBox="0 0 87 78" fill="none" className={styles.cardIcon}>
                    <path d="M60.8507 33.3051V0H43.1523V21.3317V24.6377L43.258 26.763C43.815 32.7191 46.6959 38.0717 51.0844 42.0687C55.982 46.5292 62.7425 49.2842 70.2137 49.2842H97.2654V33.3051H60.8507Z" fill="white"/>
                    <path d="M27.0613 38.0476H0V54.0267H36.5683V87.3318H54.113V62.6853C54.113 49.0764 41.994 38.0388 27.0517 38.0388L27.0613 38.0476Z" fill="white"/>
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

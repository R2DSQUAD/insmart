import styles from "./index.module.css";

export default function IndexComponent() {
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
                        <svg width="401" height="56" viewBox="0 0 401 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M33.4015 21.2228V0.535156H23.6875V13.7855V15.839L23.7455 17.1592C24.0512 20.8588 25.6324 24.1836 28.0412 26.6664C30.7293 29.437 34.4399 31.1483 38.5406 31.1483H53.3883V21.2228H33.4015Z" fill="#28FEC6" />
                            <path d="M14.8531 24.1656H0V34.0911H20.0711V54.7787H29.7008V39.4695C29.7008 31.0162 23.0491 24.1602 14.8478 24.1602L14.8531 24.1656Z" fill="#007BFF" />
                            <path d="M78.1494 1.50195V54.3691H71.0938V1.50195H78.1494Z" fill="#007BFF" />
                            <path d="M131.906 44.8918V1.50195H138.962V54.3691H128.872L97.7744 10.9739V54.3691H90.7188V1.50195H100.809L131.906 44.8972V44.8918Z" fill="#007BFF" />
                            <path d="M151.529 54.3691V1.50195H162.611L181.469 43.2401L200.268 1.50195H211.35V54.3691H204.294V10.6002L184.663 54.3691H178.21L158.579 10.6002V54.3691H151.523H151.529Z" fill="#007BFF" />
                            <path d="M264.741 1.50195V9.92323H230.999V23.7601H263.642V32.1056H230.999V46.0183H264.741V54.3637H223.938V1.50195H264.741Z" fill="#007BFF" />
                            <path d="M304.037 1.50195C314.292 1.50195 323.06 9.92323 323.06 27.9735C323.06 46.0237 314.292 54.3691 304.037 54.3691H276.305V1.50195H304.037ZM283.36 45.7962H300.453C310.431 45.7962 315.508 42.4873 315.508 27.9735C315.508 13.4596 310.436 10.0749 300.453 10.0749H283.36V45.7962Z" fill="#007BFF" />
                            <path d="M341.134 1.50195V54.3691H334.078V1.50195H341.134Z" fill="#007BFF" />
                            <path d="M376.978 0C391.702 0 399.254 9.09823 400.411 20.6064H392.801C391.756 13.0841 386.406 8.57291 376.978 8.57291C366.226 8.57291 359.72 14.2106 359.72 27.9012C359.72 41.5919 366.279 47.3054 376.978 47.3054C386.353 47.3054 391.756 42.6425 392.801 35.1202H400.464C399.254 46.7042 391.697 55.8783 376.978 55.8783C360.216 55.8783 352.109 44.9712 352.109 27.9012C352.109 10.8312 360.216 0 376.978 0Z" fill="#007BFF" />
                        </svg>
                        <h2>계절 근로자 구독 서비스</h2>
                    </div>
                    <div className={styles.indexDescription}>
                        <div className={styles.indexDescriptionCircle}>
                            <img src="/images/indexDescriptionImage.png" alt="캐릭터 이미지" className={styles.descriptionImage} />
                        </div>
                        <span className={styles.descriptionTitle}>외국인 계정 근로자 단체 상해보험</span>
                        <p className={styles.descriptionContent}>의료 통역부터 보험처리까지</p>
                        <p className={styles.descriptionContent}>쉽고 간편하게 제공합니다</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

import Image from "next/image";
import styles from "./ProfileImage.module.css";
import config from "@/app/utils/config";

function ProfileImage({userId, width = '2rem', height = '2rem'}) {
  return (
    <div className={styles.ProfileImage} style={{width, height}}>
      <Image
        src={`${config.server}/profile-image/${userId}.jpeg`}
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        alt={`${userId} profile image`}
      />
    </div>
  )
}

export default ProfileImage;
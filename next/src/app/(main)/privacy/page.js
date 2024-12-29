import Link from "next/link";
import styles from "./page.module.css";

export default function Privacy() {
  return (
    <div className={styles.Privacy}>
      <div className={"layer"}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p>Last updated December 28, 2024</p>
      </div>
      <div className="layer">
        <div className={"description"}>
          <p>
            This privacy notice for FLOZABLE ("we," "us," or "our"), describes
            how and why we might collect, store, use, and/or share ( "process" )
            your information when you use our services ( "Services"), such as
            when you:
          </p>
          <ul>
            <li>
              Visit our website at https://flozable.com , or any website of ours
              that links to this privacy notice
            </li>
            <li>
              Engage with us in other related ways, including any sales,
              marketing, or events
            </li>
          </ul>
          <p>
            <strong>Questions or concerns? </strong>
            Reading this privacy notice will help you understand your privacy
            rights and choices. If you do not agree with our policies and
            practices, please do not use our Services. If you still have any
            questions or concerns, please contact us at support@flozable.com.
          </p>
        </div>
      </div>
      <div className="layer">
        <h2 className="heading">SUMMARY OF KEY POINTS</h2>

        <div className={"description"}>
          <p>
            This summary provides key points from our privacy notice, but you
            can find out more details about any of these topics by clicking the
            link following each key point or by using our table of contents
            below to find the section you are looking for.
          </p>
          <p>
            What personal information do we process? When you visit, use, or
            navigate our Services, we may process personal information depending
            on how you interact with us and the Services, the choices you make,
            and the products and features you use. Learn more about personal
            information you disclose to us.
          </p>
          <p>
            Do we process any sensitive personal information? We do not process
            sensitive personal information.
          </p>
          <p>
            Do we receive any information from third parties? We do not receive
            any information from third parties.
          </p>
          <p>
            How do we process your information? We process your information to
            provide, improve, and administer our Services, communicate with you,
            for security and fraud prevention, and to comply with law. We may
            also process your information for other purposes with your consent.
            We process your information only when we have a valid legal reason
            to do so. Learn more about how we process your information.
          </p>
          <p>
            In what situations and with which parties do we share personal
            information? We may share information in specific situations and
            with specific third parties. Learn more about when and with whom we
            share your personal information.
          </p>
          <p>
            How do we keep your information safe? We have organizational and
            technical processes and procedures in place to protect your personal
            information. However, no electronic transmission over the internet
            or information storage technology can be guaranteed to be 100%
            secure, so we cannot promise or guarantee that hackers,
            cybercriminals, or other unauthorized third parties will not be able
            to defeat our security and improperly collect, access, steal, or
            modify your information. Learn more about how we keep your
            information safe.
          </p>
          <p>
            What are your rights? Depending on where you are located
            geographically, the applicable privacy law may mean you have certain
            rights regarding your personal information. Learn more about your
            privacy rights.
          </p>
          <div>
            <h3 className={"subHeading"}>
              Compliance with Google API Services User Data Policy
            </h3>
            <p>
              FLOZABLE is committed to protecting the privacy and security of
              user data. Our use and transfer of information received from
              Google APIs will adhere to the
              <a href=""> Google API Services User Data Policy</a> , including
              the Limited Use requirements. This means that we only access, use,
              and store Google user data in a way that is necessary to provide
              and improve our services, and we do not share this data with any
              third parties without explicit user consent.
            </p>
          </div>
          <p>
            Limited Use Policy Disclosure FLOZABLE’s use and transfer of
            information received from Google APIs will adhere to Google API
            Services User Data Policy, including the Limited Use requirements.
            We only access data that is necessary to provide and improve our
            services, and we will not transfer data to other apps or services
            without explicit user consent. We do not sell or use this data for
            advertising purposes.
          </p>
          <p>
            Data Sharing and User Consent To provide certain features of
            FLOZABLE, we may need to share data with specific, trusted
            third-party tools to enhance functionality, such as connecting with
            other productivity platforms. If we share your data with any
            third-party services, this will only occur after obtaining your
            explicit consent. You will be prompted to consent to such data
            sharing separately from the general OAuth consent. You may opt-out
            at any time if you choose not to share your data with these external
            services.
          </p>
          <p>
            User Control and Data Access Users have control over how their data
            is used in FLOZABLE. You can manage your data-sharing preferences
            and withdraw consent at any time by visiting your account settings.
            If you wish to revoke FLOZABLE’s access to your Google data, you can
            do so via your Google account permissions at any time.
          </p>
          <p>
            How do you exercise your rights? The easiest way to exercise your
            rights is by visiting https://flozable.com/dashboard/account , or by
            contacting us. We will consider and act upon any request in
            accordance with applicable data protection laws.
          </p>
          <p>
            Want to learn more about what we do with any information we collect?
            Review the privacy notice in full.
          </p>
        </div>
      </div>
      <div className="layer" id={styles.tableOfContents}>
        <h2 className="heading">TABLE OF CONTENTS</h2>
        <div className="description">
          <ol>
            <li>
              <Link href={""}>WHAT INFORMATION DO WE COLLECT?</Link>
            </li>
            <li>
              <Link href={""}>HOW DO WE PROCESS YOUR INFORMATION?</Link>
            </li>
            <li>
              <Link href={""}>
                WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL
                INFORMATION?
              </Link>
            </li>
            <li>
              <Link href={""}>
                WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
              </Link>
            </li>
            <li>
              <Link href={""}>
                DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
              </Link>
            </li>
            <li>
              <Link href={""}>HOW DO WE HANDLE YOUR SOCIAL LOGINS?</Link>
            </li>
            <li>
              <Link href={""}>HOW LONG DO WE KEEP YOUR INFORMATION?</Link>
            </li>
            <li>
              <Link href={""}>HOW DO WE KEEP YOUR INFORMATION SAFE?</Link>
            </li>
            <li>
              <Link href={""}>WHAT ARE YOUR PRIVACY RIGHTS?</Link>
            </li>
            <li>
              <Link href={""}>CONTROLS FOR DO-NOT-TRACK FEATURES</Link>
            </li>
            <li>
              <Link href={""}>
                DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?
              </Link>
            </li>
            <li>
              <Link href={""}>DO WE MAKE UPDATES TO THIS NOTICE?</Link>
            </li>
            <li>
              <Link href={""}>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</Link>
            </li>
            <li>
              <Link href={""}>
                HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM
                YOU?
              </Link>
            </li>
          </ol>
        </div>
      </div>
      <div className="layer">
        <h2 className="heading">1. WHAT INFORMATION DO WE COLLECT?</h2>
        <h3 className="subHeading">Personal information you disclose to us</h3>
        <div className={"description"}>
          <p>
            In Short: We collect personal information that you provide to us.
          </p>
          <p>
            We collect personal information that you voluntarily provide to us
            when you register on the Services, express an interest in obtaining
            information about us or our products and Services, when you
            participate in activities on the Services, or otherwise when you
            contact us.
          </p>
          <p>
            Personal Information Provided by You. The personal information that
            we collect depends on the context of your interactions with us and
            the Services, the choices you make, and the products and features
            you use. The personal information we collect may include the
            following:
          </p>
          <ul>
            <li>names</li>
            <li>email addresses</li>
            <li>user names</li>
            <li>passwords</li>
            <li>contact or authentication data</li>
          </ul>
          <p>
            <strong>Sensitive information. </strong> We do not process sensitive
            information
          </p>
          <p>
            <strong>Social Media Login Data. </strong> We may provide you with
            the option to register with us using your existing social media
            account details, like your Facebook, Twitter, or other social media
            account. If you choose to register in this way, we will collect the
            information described in the section called{" "}
            <Link href={""}>"HOW DO WE HANDLE YOUR SOCIAL LOGINS? "</Link>
            below.
          </p>
          <p>
            All personal information that you provide to us must be true,
            complete, and accurate, and you must notify us of any changes to
            such personal information.
          </p>
        </div>
        <h3 className="subHeading">Information automatically collected</h3>
        <div className={"description"}>
          <p>
            In Short: Some information — such as your Internet Protocol (IP)
            address and/or browser and device characteristics — is collected
            automatically when you visit our Services.
          </p>
          <p>
            We automatically collect certain information when you visit, use, or
            navigate the Services. This information does not reveal your
            specific identity (like your name or contact information) but may
            include device and usage information, such as your IP address,
            browser and device characteristics, operating system, language
            preferences, referring URLs, device name, country, location,
            information about how and when you use our Services, and other
            technical information. This information is primarily needed to
            maintain the security and operation of our Services, and for our
            internal analytics and reporting purposes.
          </p>
          <p>
            Like many businesses, we also collect information through cookies
            and similar technologies. You can find out more about this in our
            Cookie Notice:{" "}
            <Link href="https://flozable.com/cookies">
              https://flozable.com/cookies
            </Link>
            .
          </p>
          <p>The information we collect includes:</p>
          <ul>
            <li>
              <strong>Location Data.</strong> We collect location data such as
              information about your device's location, which can be either
              precise or imprecise. How much information we collect depends on
              the type and settings of the device you use to access the
              Services. For example, we may use GPS and other technologies to
              collect geolocation data that tells us your current location
              (based on your IP address). You can opt out of allowing us to
              collect this information either by refusing access to the
              information or by disabling your Location setting on your device.
              However, if you choose to opt out, you may not be able to use
              certain aspects of the Services.
            </li>
          </ul>
        </div>
      </div>
      <div className="layer">
        <h2 className="heading">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
        <div className={"description"}>
          <p>
            In Short: We process your information to provide, improve, and
            administer our Services, communicate with you, for security and
            fraud prevention, and to comply with law. We may also process your
            information for other purposes with your consent.
          </p>
          <p>
            We process your personal information for a variety of reasons,
            depending on how you interact with our Services, including:
          </p>
          <ul>
            <li>
              To facilitate account creation and authentication and otherwise
              manage user accounts. We may process your information so you can
              create and log in to your account, as well as keep your account in
              working order.
            </li>
            <li>
              To save or protect an individual's vital interest. We may process
              your information when necessary to save or protect an individual's
              vital interest, such as to prevent harm.
            </li>
          </ul>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">
          3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?
        </h2>
        <div className={"description"}>
          <p>
            In Short: We only process your personal information when we believe
            it is necessary and we have a valid legal reason (i.e., legal basis)
            to do so under applicable law, like with your consent, to comply
            with laws, to provide you with services to enter into or fulfill our
            contractual obligations, to protect your rights, or to fulfill our
            legitimate business interests.
          </p>
          <h3 className="subHeading">
            If you are located in the EU or UK, this section applies to you.
          </h3>
          <p>
            The General Data Protection Regulation (GDPR) and UK GDPR require us
            to explain the valid legal bases we rely on in order to process your
            personal information. As such, we may rely on the following legal
            bases to process your personal information:
          </p>
          <ul>
            <li>
              <strong>Consent.</strong> We may process your information if you
              have given us permission (i.e., consent) to use your personal
              information for a specific purpose. You can withdraw your consent
              at any time. Learn more about withdrawing your consent.
            </li>
            <li>
              <strong>Legal Obligations.</strong> We may process your
              information where we believe it is necessary for compliance with
              our legal obligations, such as to cooperate with a law enforcement
              body or regulatory agency, exercise or defend our legal rights, or
              disclose your information as evidence in litigation in which we
              are involved.
            </li>
            <li>
              <strong>Vital Interests.</strong> We may process your information
              where we believe it is necessary to protect your vital interests
              or the vital interests of a third party, such as situations
              involving potential threats to the safety of any person.
            </li>
          </ul>

          <h3 className="subHeading">
            If you are located in Canada, this section applies to you.
          </h3>
          <p>
            We may process your information if you have given us specific
            permission (i.e., express consent) to use your personal information
            for a specific purpose, or in situations where your permission can
            be inferred (i.e., implied consent). You can withdraw your consent
            at any time.
          </p>
          <p>
            In some exceptional cases, we may be legally permitted under
            applicable law to process your information without your consent,
            including, for example:
          </p>
          <ul>
            <li>
              If collection is clearly in the interests of an individual and
              consent cannot be obtained in a timely way
            </li>
            <li>For investigations and fraud detection and prevention</li>
            <li>
              For business transactions provided certain conditions are met
            </li>
            <li>
              If it is contained in a witness statement and the collection is
              necessary to assess, process, or settle an insurance claim
            </li>
            <li>
              For identifying injured, ill, or deceased persons and
              communicating with next of kin
            </li>
            <li>
              If we have reasonable grounds to believe an individual has been,
              is, or may be victim of financial abuse
            </li>
            <li>
              If it is reasonable to expect collection and use with consent
              would compromise the availability or the accuracy of the
              information and the collection is reasonable for purposes related
              to investigating a breach of an agreement or a contravention of
              the laws of Canada or a province
            </li>
            <li>
              If disclosure is required to comply with a subpoena, warrant,
              court order, or rules of the court relating to the production of
              records
            </li>
            <li>
              If it was produced by an individual in the course of their
              employment, business, or profession and the collection is
              consistent with the purposes for which the information was
              produced
            </li>
            <li>
              If the collection is solely for journalistic, artistic, or
              literary purposes
            </li>
            <li>
              If the information is publicly available and is specified by the
              regulations
            </li>
          </ul>
        </div>
      </div>
      <div className="layer">
        <h2 className="heading">
          4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
        </h2>
        <div className={"description"}>
          <p>
            In Short: We may share information in specific situations described
            in this section and/or with the following third parties.
          </p>
          <p>
            We may need to share your personal information in the following
            situations:
          </p>
          <ul>
            <li>
              <strong>Business Transfers.</strong> We may share or transfer your
              information in connection with, or during negotiations of, any
              merger, sale of company assets, financing, or acquisition of all
              or a portion of our business to another company.
            </li>
          </ul>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">
          5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
        </h2>
        <div className={"description"}>
          <p>
            In Short: We may use cookies and other tracking technologies to
            collect and store your information.
          </p>
          <p>
            We may use cookies and similar tracking technologies (like web
            beacons and pixels) to access or store information. Specific
            information about how we use such technologies and how you can
            refuse certain cookies is set out in our Cookie Notice:{" "}
            <Link href="https://flozable.com/cookies">
              https://flozable.com/cookies
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
        <div className={"description"}>
          <p>
            In Short: If you choose to register or log in to our Services using
            a social media account, we may have access to certain information
            about you.
          </p>
          <p>
            Our Services offer you the ability to register and log in using your
            third-party social media account details (like your Facebook or
            Twitter logins). Where you choose to do this, we will receive
            certain profile information about you from your social media
            provider. The profile information we receive may vary depending on
            the social media provider concerned, but will often include your
            name, email address, friends list, and profile picture, as well as
            other information you choose to make public on such a social media
            platform.
          </p>
          <p>
            We will use the information we receive only for the purposes that
            are described in this privacy notice or that are otherwise made
            clear to you on the relevant Services. Please note that we do not
            control, and are not responsible for, other uses of your personal
            information by your third-party social media provider. We recommend
            that you review their privacy notice to understand how they collect,
            use, and share your personal information, and how you can set your
            privacy preferences on their sites and apps.
          </p>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
        <div className={"description"}>
          <p>
            In Short: We keep your information for as long as necessary to
            fulfill the purposes outlined in this privacy notice unless
            otherwise required by law.
          </p>
          <p>
            We will only keep your personal information for as long as it is
            necessary for the purposes set out in this privacy notice, unless a
            longer retention period is required or permitted by law (such as
            tax, accounting, or other legal requirements). No purpose in this
            notice will require us keeping your personal information for longer
            than the period of time in which users have an account with us.
          </p>
          <p>
            When we have no ongoing legitimate business need to process your
            personal information, we will either delete or anonymize such
            information, or, if this is not possible (for example, because your
            personal information has been stored in backup archives), then we
            will securely store your personal information and isolate it from
            any further processing until deletion is possible.
          </p>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
        <div className={"description"}>
          <p>
            In Short: We aim to protect your personal information through a
            system of organizational and technical security measures.
          </p>
          <p>
            We have implemented appropriate and reasonable technical and
            organizational security measures designed to protect the security of
            any personal information we process. However, despite our safeguards
            and efforts to secure your information, no electronic transmission
            over the Internet or information storage technology can be
            guaranteed to be 100% secure, so we cannot promise or guarantee that
            hackers, cybercriminals, or other unauthorized third parties will
            not be able to defeat our security and improperly collect, access,
            steal, or modify your information. Although we will do our best to
            protect your personal information, transmission of personal
            information to and from our Services is at your own risk. You should
            only access the Services within a secure environment.
          </p>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">9. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
        <div className={"description"}>
          <p>
            In Short: In some regions, such as the European Economic Area (EEA),
            United Kingdom (UK), Switzerland, and Canada, you have rights that
            allow you greater access to and control over your personal
            information. You may review, change, or terminate your account at
            any time.
          </p>
          <p>
            In some regions (like the EEA, UK, Switzerland, and Canada), you
            have certain rights under applicable data protection laws. These may
            include the right (i) to request access and obtain a copy of your
            personal information, (ii) to request rectification or erasure;
            (iii) to restrict the processing of your personal information; (iv)
            if applicable, to data portability; and (v) not to be subject to
            automated decision-making. In certain circumstances, you may also
            have the right to object to the processing of your personal
            information. You can make such a request by contacting us by using
            the contact details provided in the section "HOW CAN YOU CONTACT US
            ABOUT THIS NOTICE?" below.
          </p>
          <p>
            We will consider and act upon any request in accordance with
            applicable data protection laws.
          </p>
          <p>
            If you are located in the EEA or UK and you believe we are
            unlawfully processing your personal information, you also have the
            right to complain to your Member State data protection authority or
            UK data protection authority.
          </p>
          <p>
            If you are located in Switzerland, you may contact the Federal Data
            Protection and Information Commissioner.
          </p>
          <h3 className="subHeading">Withdrawing your consent</h3>
          <p>
            If we are relying on your consent to process your personal
            information, which may be express and/or implied consent depending
            on the applicable law, you have the right to withdraw your consent
            at any time. You can withdraw your consent at any time by contacting
            us by using the contact details provided in the section "HOW CAN YOU
            CONTACT US ABOUT THIS NOTICE?" below or updating your preferences.
          </p>
          <p>
            However, please note that this will not affect the lawfulness of the
            processing before its withdrawal nor, when applicable law allows,
            will it affect the processing of your personal information conducted
            in reliance on lawful processing grounds other than consent.
          </p>
          <h3 className="subHeading">Account Information</h3>
          <p>
            If you would at any time like to review or change the information in
            your account or terminate your account, you can:
          </p>
          <ul>
            <li>
              Log in to your account settings and update your user account.
            </li>
          </ul>
          <p>
            Upon your request to terminate your account, we will deactivate or
            delete your account and information from our active databases.
            However, we may retain some information in our files to prevent
            fraud, troubleshoot problems, assist with any investigations,
            enforce our legal terms and/or comply with applicable legal
            requirements.
          </p>
          <h3 className="subHeading">Cookies and similar technologies</h3>
          <p>
            Most Web browsers are set to accept cookies by default. If you
            prefer, you can usually choose to set your browser to remove cookies
            and to reject cookies. If you choose to remove cookies or reject
            cookies, this could affect certain features or services of our
            Services. For further information, please see our Cookie Notice:{" "}
            <Link href="https://flozable.com/cookies">
              https://flozable.com/cookies
            </Link>
            .
          </p>
          <p>
            If you have questions or comments about your privacy rights, you may
            email us at{" "}
            <Link href="mailto:support@flozable.com">support@flozable.com</Link>
            .
          </p>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">10. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
        <div className={"description"}>
          <p>
            Most web browsers and some mobile operating systems and mobile
            applications include a Do-Not-Track ("DNT") feature or setting you
            can activate to signal your privacy preference not to have data
            about your online browsing activities monitored and collected. At
            this stage no uniform technology standard for recognizing and
            implementing DNT signals has been finalized. As such, we do not
            currently respond to DNT browser signals or any other mechanism that
            automatically communicates your choice not to be tracked online. If
            a standard for online tracking is adopted that we must follow in the
            future, we will inform you about that practice in a revised version
            of this privacy notice.
          </p>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">
          11. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?
        </h2>
        <div className={"description"}>
          <p>
            In Short: If you are a resident of California, Colorado,
            Connecticut, Utah or Virginia, you are granted specific rights
            regarding access to your personal information.
          </p>

          <h3 className="subHeading">
            What categories of personal information do we collect?
          </h3>
          <p>
            We have collected the following categories of personal information
            in the past twelve (12) months:
          </p>
          <p>
            We will use and retain the collected personal information as needed
            to provide the Services or for:
          </p>
          <ul>
            <li>Category B - As long as the user has an account with us</li>
          </ul>
          <p>
            We may also collect other personal information outside of these
            categories through instances where you interact with us in person,
            online, or by phone or mail in the context of:
          </p>
          <ul>
            <li>Receiving help through our customer support channels;</li>
            <li>Participation in customer surveys or contests; and</li>
            <li>
              Facilitation in the delivery of our Services and to respond to
              your inquiries.
            </li>
          </ul>

          <h3 className="subHeading">
            How do we use and share your personal information?
          </h3>
          <p>
            Learn about how we use your personal information in the section,{" "}
            <Link href="#how-we-process">
              "HOW DO WE PROCESS YOUR INFORMATION?"
            </Link>
          </p>

          <h3 className="subHeading">
            Will your information be shared with anyone else?
          </h3>
          <p>
            We may disclose your personal information with our service providers
            pursuant to a written contract between us and each service provider.
            Learn more about how we disclose personal information in the
            section,{" "}
            <Link href="#information-sharing">
              "WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?"
            </Link>
          </p>
          <p>
            We may use your personal information for our own business purposes,
            such as for undertaking internal research for technological
            development and demonstration. This is not considered to be
            "selling" of your personal information.
          </p>
          <p>
            We have not disclosed, sold, or shared any personal information to
            third parties for a business or commercial purpose in the preceding
            twelve (12) months. We will not sell or share personal information
            in the future belonging to website visitors, users, and other
            consumers.
          </p>

          <h3 className="subHeading">California Residents</h3>
          <p>
            California Civil Code Section 1798.83, also known as the "Shine The
            Light" law permits our users who are California residents to request
            and obtain from us, once a year and free of charge, information
            about categories of personal information (if any) we disclosed to
            third parties for direct marketing purposes and the names and
            addresses of all third parties with which we shared personal
            information in the immediately preceding calendar year. If you are a
            California resident and would like to make such a request, please
            submit your request in writing to us using the contact information
            provided below.
          </p>
          <p>
            If you are under 18 years of age, reside in California, and have a
            registered account with the Services, you have the right to request
            removal of unwanted data that you publicly post on the Services. To
            request removal of such data, please contact us using the contact
            information provided below and include the email address associated
            with your account and a statement that you reside in California. We
            will make sure the data is not publicly displayed on the Services,
            but please be aware that the data may not be completely or
            comprehensively removed from all our systems (e.g., backups, etc.).
          </p>

          <h4 className="subHeading">CCPA Privacy Notice</h4>
          <p>
            This section applies only to California residents. Under the
            California Consumer Privacy Act (CCPA), you have the rights listed
            below.
          </p>
          <p>The California Code of Regulations defines a "residents" as:</p>
          <ul>
            <li>
              (1) every individual who is in the State of California for other
              than a temporary or transitory purpose and
            </li>
            <li>
              (2) every individual who is domiciled in the State of California
              who is outside the State of California for a temporary or
              transitory purpose
            </li>
          </ul>
          <p>All other individuals are defined as "non-residents."</p>
          <p>
            If this definition of "resident" applies to you, we must adhere to
            certain rights and obligations regarding your personal information.
          </p>

          <h4 className="subHeading">
            Your rights with respect to your personal data
          </h4>
          <ul>
            <li>
              <strong>
                Right to request deletion of the data — Request to delete
              </strong>
              <p>
                You can ask for the deletion of your personal information. If
                you ask us to delete your personal information, we will respect
                your request and delete your personal information, subject to
                certain exceptions provided by law, such as (but not limited to)
                the exercise by another consumer of his or her right to free
                speech, our compliance requirements resulting from a legal
                obligation, or any processing that may be required to protect
                against illegal activities.
              </p>
            </li>
            <li>
              <strong>Right to be informed — Request to know</strong>
              <p>Depending on the circumstances, you have a right to know:</p>
              <ul>
                <li>whether we collect and use your personal information;</li>
                <li>the categories of personal information that we collect;</li>
                <li>
                  the purposes for which the collected personal information is
                  used;
                </li>
                <li>
                  whether we sell or share personal information to third
                  parties;
                </li>
                <li>
                  the categories of personal information that we sold, shared,
                  or disclosed for a business purpose;
                </li>
                <li>
                  the categories of third parties to whom the personal
                  information was sold, shared, or disclosed for a business
                  purpose;
                </li>
                <li>
                  the business or commercial purpose for collecting, selling, or
                  sharing personal information; and
                </li>
                <li>
                  the specific pieces of personal information we collected about
                  you.
                </li>
              </ul>
            </li>
          </ul>

          <h3 className="subHeading">Colorado Residents</h3>
          <p>
            This section applies only to Colorado residents. Under the Colorado
            Privacy Act (CPA), you have the rights listed below. However, these
            rights are not absolute, and in certain cases, we may decline your
            request as permitted by law.
          </p>
          <ul>
            <li>
              Right to be informed whether or not we are processing your
              personal data
            </li>
            <li>Right to access your personal data</li>
            <li>Right to correct inaccuracies in your personal data</li>
            <li>Right to request deletion of your personal data</li>
            <li>
              Right to obtain a copy of the personal data you previously shared
              with us
            </li>
            <li>
              Right to opt out of the processing of your personal data if it is
              used for targeted advertising, the sale of personal data, or
              profiling in furtherance of decisions that produce legal or
              similarly significant effects ("profiling")
            </li>
          </ul>
          <p>
            To submit a request to exercise these rights described above, please
            email <a href="mailto:privacy@flozable.com">privacy@flozable.com</a>{" "}
            or visit{" "}
            <a href="https://flozable.com/dashboard/account">
              https://flozable.com/dashboard/account
            </a>
            .
          </p>
          <p>
            If we decline to take action regarding your request and you wish to
            appeal our decision, please email us at{" "}
            <a href="mailto:privacy@flozable.com">privacy@flozable.com</a>.
            Within forty-five (45) days of receipt of an appeal, we will inform
            you in writing of any action taken or not taken in response to the
            appeal, including a written explanation of the reasons for the
            decisions.
          </p>

          <h3 className="subHeading">Connecticut Residents</h3>
          <p>
            This section applies only to Connecticut residents. Under the
            Connecticut Data Privacy Act (CTDPA), you have the rights listed
            below. However, these rights are not absolute, and in certain cases,
            we may decline your request as permitted by law.
          </p>
          <ul>
            <li>
              Right to be informed whether or not we are processing your
              personal data
            </li>
            <li>Right to access your personal data</li>
            <li>Right to correct inaccuracies in your personal data</li>
            <li>Right to request deletion of your personal data</li>
            <li>
              Right to obtain a copy of the personal data you previously shared
              with us
            </li>
            <li>
              Right to opt out of the processing of your personal data if it is
              used for targeted advertising, the sale of personal data, or
              profiling in furtherance of decisions that produce legal or
              similarly significant effects ("profiling")
            </li>
          </ul>
          <p>
            To submit a request to exercise these rights described above, please
            email <a href="mailto:privacy@flozable.com">privacy@flozable.com</a>{" "}
            or visit{" "}
            <a href="https://flozable.com/dashboard/account">
              https://flozable.com/dashboard/account
            </a>
            .
          </p>
          <p>
            If we decline to take action regarding your request and you wish to
            appeal our decision, please email us at{" "}
            <a href="mailto:privacy@flozable.com">privacy@flozable.com</a>.
            Within sixty (60) days of receipt of an appeal, we will inform you
            in writing of any action taken or not taken in response to the
            appeal, including a written explanation of the reasons for the
            decisions.
          </p>

          <h3 className="subHeading">Utah Residents</h3>
          <p>
            This section applies only to Utah residents. Under the Utah Consumer
            Privacy Act (UCPA), you have the rights listed below. However, these
            rights are not absolute, and in certain cases, we may decline your
            request as permitted by law.
          </p>
          <ul>
            <li>
              Right to be informed whether or not we are processing your
              personal data
            </li>
            <li>Right to access your personal data</li>
            <li>Right to request deletion of your personal data</li>
            <li>
              Right to obtain a copy of the personal data you previously shared
              with us
            </li>
            <li>
              Right to opt out of the processing of your personal data if it is
              used for targeted advertising or the sale of personal data
            </li>
          </ul>
          <p>
            To submit a request to exercise these rights described above, please
            email <a href="mailto:privacy@flozable.com">privacy@flozable.com</a>{" "}
            or visit{" "}
            <a href="https://flozable.com/dashboard/account">
              https://flozable.com/dashboard/account
            </a>
            .
          </p>

          <h3 className="subHeading">Virginia Residents</h3>
          <p>Under the Virginia Consumer Data Protection Act (VCDPA):</p>
          <ul>
            <li>
              "Consumer" means a natural person who is a resident of the
              Commonwealth acting only in an individual or household context. It
              does not include a natural person acting in a commercial or
              employment context.
            </li>
            <li>
              "Personal data" means any information that is linked or reasonably
              linkable to an identified or identifiable natural person.
              "Personal data" does not include de-identified data or publicly
              available information.
            </li>
            <li>
              "Sale of personal data" means the exchange of personal data for
              monetary consideration.
            </li>
          </ul>
          <p>
            If this definition of "consumer" applies to you, we must adhere to
            certain rights and obligations regarding your personal data.
          </p>
          <h4>Your rights with respect to your personal data</h4>
          <ul>
            <li>
              Right to be informed whether or not we are processing your
              personal data
            </li>
            <li>Right to access your personal data</li>
            <li>Right to correct inaccuracies in your personal data</li>
            <li>Right to request deletion of your personal data</li>
            <li>
              Right to obtain a copy of the personal data you previously shared
              with us
            </li>
            <li>
              Right to opt out of the processing of your personal data if it is
              used for targeted advertising, the sale of personal data, or
              profiling in furtherance of decisions that produce legal or
              similarly significant effects ("profiling")
            </li>
          </ul>
          <h4>Exercise your rights provided under the Virginia VCDPA</h4>
          <p>
            You may contact us by email at{" "}
            <a href="mailto:privacy@flozable.com">privacy@flozable.com</a> or
            visit{" "}
            <a href="https://flozable.com/dashboard/account">
              https://flozable.com/dashboard/account
            </a>
            .
          </p>
          <p>
            If you are using an authorized agent to exercise your rights, we may
            deny a request if the authorized agent does not submit proof that
            they have been validly authorized to act on your behalf.
          </p>
          <h4>Verification process</h4>
          <p>
            We may request that you provide additional information reasonably
            necessary to verify you and your consumer's request. If you submit
            the request through an authorized agent, we may need to collect
            additional information to verify your identity before processing
            your request.
          </p>
          <p>
            Upon receiving your request, we will respond without undue delay,
            but in all cases, within forty-five (45) days of receipt. The
            response period may be extended once by forty-five (45) additional
            days when reasonably necessary. We will inform you of any such
            extension within the initial 45-day response period, together with
            the reason for the extension.
          </p>
          <h4>Right to appeal</h4>
          <p>
            If we decline to take action regarding your request, we will inform
            you of our decision and reasoning behind it. If you wish to appeal
            our decision, please email us at{" "}
            <a href="mailto:privacy@flozable.com">privacy@flozable.com</a>.
            Within sixty (60) days of receipt of an appeal, we will inform you
            in writing of any action taken or not taken in response to the
            appeal, including a written explanation of the reasons for the
            decisions. If your appeal is denied, you may contact the Attorney
            General to submit a complaint.
          </p>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">12. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
        <div className="description">
          <p>
            <strong>In Short:</strong> Yes, we will update this notice as
            necessary to stay compliant with relevant laws.
          </p>
          <p>
            We may update this privacy notice from time to time. The updated
            version will be indicated by an updated "Revised" date, and the
            updated version will be effective as soon as it is accessible. If we
            make material changes to this privacy notice, we may notify you
            either by prominently posting a notice of such changes or by
            directly sending you a notification. We encourage you to review this
            privacy notice frequently to be informed of how we are protecting
            your information.
          </p>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">
          13. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
        </h2>
        <div className="description">
          <p>
            If you have questions or comments about this notice, you may contact
            us by post at:
          </p>
          <address>
            <strong>FLOZABLE</strong>
            <br />
            5363 Harwood Rd
            <br />
            San Jose, CA 95124
            <br />
            United States
          </address>
        </div>
      </div>

      <div className="layer">
        <h2 className="heading">
          14. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM
          YOU?
        </h2>
        <div className="description">
          <p>
            Based on the applicable laws of your country, you may have the right
            to request access to the personal information we collect from you,
            change that information, or delete it. To request to review, update,
            or delete your personal information, please visit:
            <a
              href="https://flozable.com/dashboard/account"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://flozable.com/dashboard/account
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

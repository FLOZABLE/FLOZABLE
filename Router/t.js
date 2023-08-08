Router.post('/update/:type', upload.single('image'), async (req, res) => {
  autoSignin(req, res, (async() => {
    const type = req.params.type;

    const connection = await (await pool).getConnection();
    if (type == 'image') {
      connection.release();
      try {
        if (!req.file) {
          return res.send({ success: false, reason: 'No image file found' });
        }
  
        const imageBuffer = req.file.buffer; // Get the image buffer from the request
  
        // Process the image using sharp
        await sharp(imageBuffer)
          .toFormat('jpeg')
          .resize({ width: 800, height: 800 })
          .jpeg({ quality: 40 })
          .toFile(`./public/profile-images/${req.session.user_id}.jpeg`);
        res.send({ success: true });
      } catch (error) {
        res.send({ success: false, reason: 'Unsupported File Type' })
      }
    } else if (type == 'info') {
      let name = req.body.name;
      let email = req.body.email;
      let emailConfirm = req.body.emailConfirm;
      let language = req.body.language;
      let interest = req.body.interest;
  
      const supportedLanguages = ['English', 'Spanish', 'French'];
      if (!/^[a-zA-Z0-9]+$/.test(name)) {
        connection.release();
        return res.send({ success: false, reason: 'Invalid Name' });
      } else if (!/^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/.test(email)) {
        connection.release();
        return res.send({ success: false, reason: 'Invalid Email' });
      } else if (email !== emailConfirm) {
        connection.release();
        return res.send({ success: false, reason: 'Email Confirmation Failed' });
      } else if (!supportedLanguages.includes(language)) {
        connection.release();
        return res.send({ success: false, reason: 'Not Supported Language' });
      }
      const updateInfo = [{ name: name, email: email, language: language, interest: interest }, req.session.user_id];
      let update = await connection.query('UPDATE users set ? WHERE user_id = ?', updateInfo);
      res.send({ success: true });
      connection.release();
    } else if (type == 'password') {
      let password = req.body.password;
      let passwordConfirm = req.body.passwordConfirm;
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        connection.release();
        return res.send({ success: false, reason: 'No Special Character' });
      } else if ((password.match(/\d/g) || []).length < 2) {
        connection.release();
        return res.send({ success: false, reason: 'Need More Than 2 Numbers' });
      } else if (password.length < 6) {
        connection.release();
        return res.send({ success: false, reason: 'Too Short' });
      } else if (password !== passwordConfirm) {
        connection.release();
        return res.send({ success: false, reason: 'Password Does Not Match' });
      }
  
      connection.release();
      res.send({ success: true });
      let hashed = hashing(password);
      let salt = hashed[0];
      let hashedPw = hashed[1];
      const updateInfo = [{ hashed_password: hashedPw, salt: salt }, req.session.user_id];
      const update = await connection.query("UPDATE users set ? WHERE user_id = ?", updateInfo);
    } else if (type == 'auth') {
  
    } else if (type == 'extension-add') {
      try {
        let url = req.body.url;
        let origin;
        let domain;
        if (!/^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(\/[a-zA-Z0-9.-]*)*$/.test(url)) {
          connection.release();
          return res.send({ success: false, reason: 'Invalid URL or Domain' });
        }
        if (url.includes('https://') || url.includes('http://')) {
          origin = new URL(url).origin;
          domain = new URL(url).hostname;
        } else {
          origin = new URL('https://' + url).origin;
          domain = new URL('https://' + url).hostname;
        }
  
        let activitySettings = await connection.query(`select activity_setting from users where user_id = ?`, [req.session.user_id]);
        activitySettings = JSON.parse(activitySettings[0].activity_setting);
        const selectedActivity = activitySettings.find(activitySetting => { return activitySetting.domain == domain });
        if (selectedActivity) {
          connection.release();
          return res.send({ success: false, reason: 'Already Exist' });
        } else {
          activitySettings.push({
            domain: domain,
            block: true,
            timer: true
          });
          const updateInfo = [{activity_setting: JSON.stringify(activitySettings)}, req.session.user_id];
          const updateSetting = await connection.query(`UPDATE users set ? where user_id = ?`, updateInfo);
        }
        connection.release();
        res.send({ success: true, origin: origin, domain: domain })
      } catch (error) {
        console.log(error)
        connection.release();
        res.send({ success: false, reason: 'Invalid URL or Domain' })
      }
    } else if (type == 'extension-setting-update') {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            domain: { type: 'string', minLength: 2, maxLength: 260 },
            block: { type: 'boolean' },
            timer: { type: 'boolean' },
          },
          required: ['domain', 'block', 'timer'],
          additionalProperties: false
        },
      };
  
      const updatedExtSettings = req.body.activitySettings;
      const isValid = isValidJSON(updatedExtSettings, schema);
      if (isValid) {
        const updateInfo = [{ activity_setting: JSON.stringify(updatedExtSettings) }, req.session.user_id];
        let update = await connection.query('UPDATE users set ? WHERE user_id = ?', updateInfo);
        connection.release();
        return res.send({ success: true });
      } else {
        connection.release();
        return res.send({ success: false, reason: 'Data Invalid' })
      }
    } else if (type == 'account') {
  
    } else if (type == 'notification') {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer', minimum: 0, maximum: 14 },
            name: { type: 'string', maxLength: 50 },
            email: { type: 'boolean' },
            push: { type: 'boolean' },
            sms: { type: 'boolean' },
          },
          required: ['id', 'name', 'email', 'push', 'sms'],
          additionalProperties: false
        },
      };
  
      const updatedNotificationSettings = req.body.notificationSettings;
      const isValid = isValidJSON(updatedNotificationSettings, schema);
      if (isValid) {
        const updateInfo = [{ notification_setting: JSON.stringify(updatedNotificationSettings) }, req.session.user_id];
        let update = await connection.query('UPDATE users set ? WHERE user_id = ?', updateInfo);
        connection.release();
        return res.send({ success: true });
      } else {
        connection.release();
        return res.send({ success: false, reason: 'Data Invalid' })
      }
    } else if (type == 'session') {
  
    }
  }));
});
# 周易排盘 APP - Android 构建环境
# 基于官方的 React Native Android 构建镜像

FROM reactnativecommunity/react-native-android:latest

# 设置工作目录
WORKDIR /app

# 复制 package.json 和锁文件
COPY package.json ./
COPY yarn.lock* ./

# 安装依赖
RUN yarn install --frozen-lockfile 2>/dev/null || npm install

# 复制项目文件
COPY . .

# 设置环境变量
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${ANDROID_HOME}/platform-tools

# 接受所有 Android licenses
RUN yes | sdkmanager --licenses 2>/dev/null || true

# 默认命令
CMD ["bash"]

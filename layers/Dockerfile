FROM lambci/lambda-base:build

ARG GM_VERSION="1.3.31"
ARG IMAGICK_VERSION="7.0.8-45"

RUN yum update -y

RUN yum install -y \
    libpng-devel \
    libjpeg-devel \
    libtiff-devel \
    libuuid-devel \
    libopenjp2-devel \
    libtiff-devel \
    libwebp-devel \
    libbz-devel \
    gcc

RUN curl -L https://github.com/ImageMagick/ImageMagick/archive/${IMAGICK_VERSION}.tar.gz -o ImageMagick-${IMAGICK_VERSION}.tar.gz && \
    tar xfz ImageMagick-${IMAGICK_VERSION}.tar.gz && \
    cd ImageMagick-${IMAGICK_VERSION} && \
    ./configure \
        --disable-dependency-tracking \
        --disable-shared \
        --enable-static \
        --prefix=/opt \
        --enable-delegate-build \
        --without-modules \
        --disable-docs \
        --without-magick-plus-plus \
        --without-perl \
        --without-x \
        --disable-openmp && \
    make all && \
    make install

RUN curl https://versaweb.dl.sourceforge.net/project/graphicsmagick/graphicsmagick/${GM_VERSION}/GraphicsMagick-${GM_VERSION}.tar.xz | tar -xJ && \
  cd GraphicsMagick-${GM_VERSION} && \
  ./configure --prefix=/opt --enable-shared=no --enable-static=yes --with-gs-font-dir=/opt/share/fonts/default/Type1 && \
  make && \
  make install

RUN cp /usr/lib64/liblcms2.so* /opt/lib && \
  cp /usr/lib64/libtiff.so* /opt/lib && \
  cp /usr/lib64/libfreetype.so* /opt/lib && \
  cp /usr/lib64/libjpeg.so* /opt/lib && \
  cp /usr/lib64/libpng*.so* /opt/lib && \
  cp /usr/lib64/libXext.so* /opt/lib && \
  cp /usr/lib64/libSM.so* /opt/lib && \
  cp /usr/lib64/libICE.so* /opt/lib && \
  cp /usr/lib64/libX11.so* /opt/lib && \
  cp /usr/lib64/liblzma.so* /opt/lib && \
  cp /usr/lib64/libxml2.so* /opt/lib && \
  cp /usr/lib64/libgomp.so* /opt/lib && \
  cp /usr/lib64/libjbig.so* /opt/lib && \
  cp /usr/lib64/libxcb.so* /opt/lib && \
  cp /usr/lib64/libXau.so* /opt/lib && \
  cp /usr/lib64/libfontconfig.so* /opt/lib && \
  cp /usr/lib64/libwebp.so* /opt/lib && \
  cp /usr/lib64/libuuid.so /opt/lib/libuuid.so.1 && \
  cp /usr/lib64/libbz2.so /opt/lib/libbz2.so.1 && \
  cp /usr/lib64/libexpat.so /opt/lib/libexpat.so.1

RUN mkdir -p /opt/share/fonts/default && \
  cp -R /usr/share/fonts/default/Type1 /opt/share/fonts/default/Type1

RUN cd /opt && \
  find . ! -perm -o=r -exec chmod +400 {} \; && \
  zip -yr /tmp/aws-lambda-image-layer.zip ./*

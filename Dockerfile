FROM ubuntu

RUN apt-get update -y && apt-get install -y bzip2 curl git cloc

# Install nvm
RUN git clone https://github.com/creationix/nvm.git /nvm 
RUN echo "source /nvm/nvm.sh # This loads NVM" > .bashrc
RUN echo ". /nvm/nvm.sh" >> /etc/bash.bashrc

# Install node
RUN /bin/bash -l -c "source /nvm/nvm.sh && nvm install 0.10.28 && nvm alias default 0.10.28"
RUN /bin/bash -l -c "source /nvm/nvm.sh && npm install -g cloc-csv2json"

VOLUME ["/repo"]

# Start the shell as the worker user
#
# Usage: docker run -t -i $IMAGE
WORKDIR /tmp

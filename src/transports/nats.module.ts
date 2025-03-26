import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ENV, NATS_SERVICE } from 'src/config';

const clientRegister = 
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: ENV.NATS_SERVERS
        }
      }
    ])

@Module({
    imports: [clientRegister],
    exports: [clientRegister]
})
export class NatsModule {}

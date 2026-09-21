from sqlalchemy.ext.asyncio import create_async_engine
from config import get_settings


settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL ,
    echo = True ,
)


SessionLocal = async_sessionmaker(
    bind = engine ,
    class_= AsyncSession,
    expire_on_commit = False,
    
)
using Microsoft.EntityFrameworkCore;
using NoteApp.Api.Entities;

namespace NoteApp.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //note constraints
            modelBuilder.Entity<Note>()
                .Property(n => n.Id)
                .HasDefaultValueSql("NEWSEQUENTIALID()");
            modelBuilder.Entity<Note>()
                .Property(n => n.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");
        }

        public DbSet<Note> Notes { get; set; }
    }
}
